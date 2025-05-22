
import { supabaseCustom } from "@/integrations/supabase/client-custom";

interface Params {
  currentOrganization: { id: string };
  supplierId?: string;
  printRunId?: string;
  productId?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export async function fetchSupplierQuotes({
  currentOrganization,
  supplierId,
  printRunId,
  productId,
  status,
  limit = 10,
  page = 1,
}: Params) {
  try {
    let query = supabaseCustom
      .from("supplier_quotes")
      .select(
        `
        *,
        supplier:supplier_id (name, supplier_name),
        print_run:print_run_id (title),
        supplier_quote_extra_costs (
          *,
          extra_cost:extra_cost_id (name)
        ),
        supplier_quote_formats (
          *,
          format:format_id (
            *,
            product:product_id (*)
          )
        )
      `,
        { count: "exact" }
      )
      .eq("organization_id", currentOrganization.id);

    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    if (printRunId) {
      query = query.eq("print_run_id", printRunId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching supplier quotes:", error);
      throw error;
    }

    const supplierQuotes = data.map((sq) => {
      // Safely extract formats using optional chaining and nullish checks
      const formats = sq.supplier_quote_formats?.filter(sqf => sqf && typeof sqf === 'object')
        .map(sqf => {
          if (!sqf || !sqf.format) return {};
          return sqf.format;
        }) || [];
        
      const extraCosts = sq.supplier_quote_extra_costs?.filter(sqec => sqec && typeof sqec === 'object')
        .map(sqec => {
          if (!sqec || !sqec.extra_cost) return {};
          return sqec.extra_cost;
        }) || [];

      return {
        ...sq,
        // Make sure we have supplier_name and title to satisfy SupplierQuote type
        supplier_name: sq.supplier?.supplier_name || sq.supplier?.name || null,
        title: sq.print_run?.title || null,
        formats,
        extraCosts,
      };
    });

    return { data: supplierQuotes, count: count || 0 };
  } catch (error) {
    console.error("Unexpected error fetching supplier quotes:", error);
    throw error;
  }
}

export async function fetchSupplierQuoteById(id: string) {
  try {
    const { data, error } = await supabaseCustom
      .from("supplier_quotes")
      .select(
        `
        *,
        supplier:supplier_id (name, supplier_name),
        print_run:print_run_id (title),
        supplier_quote_extra_costs (
          *,
          extra_cost:extra_cost_id (name, unit_of_measure_id)
        ),
        supplier_quote_formats (
          *,
          format:format_id (
            *,
            product:product_id (*)
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching supplier quote:", error);
      throw error;
    }

    // Safely extract formats using optional chaining and nullish checks
    const formats = data.supplier_quote_formats?.filter(sqf => sqf && typeof sqf === 'object')
      .map(sqf => {
        if (!sqf || !sqf.format) return {};
        return sqf.format;
      }) || [];
      
    const extraCosts = data.supplier_quote_extra_costs?.filter(sqec => sqec && typeof sqec === 'object')
      .map(sqec => {
        if (!sqec || !sqec.extra_cost) return {};
        return sqec.extra_cost;
      }) || [];

    return {
      ...data,
      // Make sure we have supplier_name and title to satisfy SupplierQuote type
      supplier_name: data.supplier?.supplier_name || data.supplier?.name || null,
      title: data.print_run?.title || null,
      formats,
      extraCosts,
    };
  } catch (error) {
    console.error("Unexpected error fetching supplier quote:", error);
    throw error;
  }
}

export async function fetchSupplierQuoteFormats(supplierQuoteId: string) {
  try {
    const { data: supplierQuoteFormats, error } = await supabaseCustom
      .from("supplier_quote_formats")
      .select(
        `
        *,
        format:format_id (
          *,
          product:product_id (*)
        )
      `
      )
      .eq("supplier_quote_id", supplierQuoteId);

    if (error) {
      console.error("Error fetching supplier quote formats:", error);
      throw error;
    }

    // Fix the type error:
    const formatIds = supplierQuoteFormats && Array.isArray(supplierQuoteFormats) 
      ? supplierQuoteFormats
          .filter(sqFormat => sqFormat && typeof sqFormat === 'object')
          .map(sqFormat => {
            const format = sqFormat.format || {};
            return typeof format === 'object' && format !== null && 'id' in format 
              ? format.id 
              : null;
          })
          .filter(Boolean) as string[]
      : [];

    return formatIds;
  } catch (error) {
    console.error("Unexpected error fetching supplier quote formats:", error);
    throw error;
  }
}
