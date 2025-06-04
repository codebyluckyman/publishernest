import { supabase } from "@/integrations/supabase/client";
import { Format } from "@/types/format";
import { PageSize } from "@/hooks/usePagination";

export async function createFormat(formatData: Omit<Format, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("formats")
      .insert(formatData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating format:", error);
    throw error;
  }
}

export async function updateFormat(id: string, data: Partial<Format>) {
  try {
    const { data: updatedData, error } = await supabase
      .from("formats")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedData;
  } catch (error: any) {
    console.error("Error updating format:", error);
    throw error;
  }
}

export async function deleteFormat(id: string) {
  try {
    const { error } = await supabase
      .from("formats")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting format:", error);
    throw error;
  }
}

export async function fetchFormats(
  organizationId: string, 
  search?: string,
  sort: string = 'format_name',
  order: 'asc' | 'desc' = 'asc',
  page: number = 0,
  pageSize: PageSize = 10
) {
  try {
    let query = supabase
      .from("formats")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId);
    
    if (search) {
      query = query.ilike("format_name", `%${search}%`);
    }
    
    query = query.order(sort, { ascending: order === 'asc' });
    
    // Apply pagination
    const from = page * pageSize;
    query = query.range(from, from + pageSize - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      total: count || 0
    };
  } catch (error: any) {
    console.error("Error fetching formats:", error);
    throw error;
  }
}

export async function fetchFormatById(id: string): Promise<Format | null> {
  try {
    const { data, error } = await supabase
      .from("formats")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error fetching format by ID:", error);
    throw error;
  }
}

// Note: We're temporarily commenting out these functions as the format_categories table doesn't exist yet
// If you need these functions, you'll need to create the format_categories table first

/*
export async function createFormatCategory(categoryData: { name: string; organization_id: string }) {
  try {
    const { data, error } = await supabase
      .from("format_categories")
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating format category:", error);
    throw error;
  }
}

export async function updateFormatCategory(id: string, name: string) {
  try {
    const { data, error } = await supabase
      .from("format_categories")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error updating format category:", error);
    throw error;
  }
}

export async function deleteFormatCategory(id: string) {
  try {
    const { error } = await supabase
      .from("format_categories")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting format category:", error);
    throw error;
  }
}
*/
