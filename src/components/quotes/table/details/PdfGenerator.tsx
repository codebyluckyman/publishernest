import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { QuoteRequest } from "@/types/quoteRequest";
import { Format } from "@/components/format/types/FormatTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

// Fetch format details directly from the database
export const getFormatDetails = async (formatId: string): Promise<Format | null> => {
  try {
    const { data, error } = await supabase
      .from("formats")
      .select("*")
      .eq("id", formatId)
      .single();
    
    if (error) {
      console.error("Error fetching format details:", error);
      return null;
    }
    
    return data as Format;
  } catch (error) {
    console.error("Error fetching format details:", error);
    return null;
  }
};

// Fetch price breaks for a format
export const getPriceBreaks = async (formatId: string) => {
  try {
    const { data, error } = await supabase
      .from("quote_request_format_price_breaks")
      .select("*")
      .eq("quote_request_format_id", formatId)
      .order("quantity", { ascending: true });
    
    if (error) {
      console.error("Error fetching price breaks:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching price breaks:", error);
    return [];
  }
};

// Fetch products for a format
export const getFormatProducts = async (formatId: string) => {
  try {
    const { data, error } = await supabase
      .from("quote_request_format_products")
      .select("*, products:product_id(title)")
      .eq("quote_request_format_id", formatId);
    
    if (error) {
      console.error("Error fetching format products:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching format products:", error);
    return [];
  }
};

export const generateQuotePDF = async (selectedRequest: QuoteRequest, currentOrganization: any) => {
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add organization logo if available
    if (currentOrganization?.logo_url) {
      try {
        // Add logo to the top right corner
        const logoWidth = 40;  // Width of logo in mm
        const logoHeight = 15; // Height of logo in mm
        const logoX = pageWidth - logoWidth - 10; // 10mm from right edge
        const logoY = 10; // 10mm from top
        
        doc.addImage(
          currentOrganization.logo_url,
          'PNG',
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
      } catch (logoError) {
        console.error("Error adding logo to PDF:", logoError);
        // Continue generating PDF without the logo
      }
    }
    
    // Add organization name if available
    if (currentOrganization?.name) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(currentOrganization.name, 14, 10);
    }
    
    // Add title and metadata
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Quote Request", pageWidth / 2, currentOrganization?.logo_url ? 30 : 15, { align: "center" });
    
    // Add quote title
    doc.setFontSize(14);
    doc.text(selectedRequest.title, pageWidth / 2, currentOrganization?.logo_url ? 40 : 25, { align: "center" });
    
    // Add basic info section
    doc.setFontSize(12);
    doc.text("Basic Information", 14, currentOrganization?.logo_url ? 50 : 35);
    
    const basicInfo = [
      ["Supplier", selectedRequest.supplier_name || selectedRequest.supplier_names?.join(", ") || "Not specified"],
      ["Status", selectedRequest.status],
      ["Requested on", formatDate(selectedRequest.requested_at)],
      ["Due date", selectedRequest.due_date ? formatDate(selectedRequest.due_date) : "Not specified"],
      ["Currency", selectedRequest.currency || "USD"]
    ];
    
    // @ts-ignore - jspdf-autotable types aren't properly recognized
    doc.autoTable({
      startY: currentOrganization?.logo_url ? 55 : 40,
      head: [["Field", "Value"]],
      body: basicInfo,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244] }
    });
    
    // Add description if exists
    if (selectedRequest.description) {
      const finalY = (doc as any).lastAutoTable.finalY || 105;
      doc.text("Description", 14, finalY + 10);
      doc.setFontSize(10);
      const descriptionLines = doc.splitTextToSize(selectedRequest.description, pageWidth - 30);
      doc.text(descriptionLines, 14, finalY + 20);
    }
    
    // Add formats section if exists
    if (selectedRequest.formats && selectedRequest.formats.length > 0) {
      const lastY = (doc as any).lastAutoTable?.finalY || 130;
      let currentY = lastY + 15;
      
      doc.setFontSize(12);
      doc.text("Formats & Products", 14, currentY);
      currentY += 10;
      
      for (let i = 0; i < selectedRequest.formats.length; i++) {
        const format = selectedRequest.formats[i];
        
        // Format header
        doc.setFontSize(11);
        doc.setTextColor(66, 133, 244);
        doc.text(`${format.format_name || 'Unknown Format'}`, 14, currentY);
        currentY += 8;
        doc.setTextColor(0, 0, 0);
        
        // Fetch and add format specifications
        const formatDetails = await getFormatDetails(format.format_id);
        
        if (formatDetails) {
          // Create format specifications table
          const formatSpecsData = [];
          
          if (formatDetails.tps_height_mm && formatDetails.tps_width_mm) {
            formatSpecsData.push(["Dimensions (HxW)", `${formatDetails.tps_height_mm}mm × ${formatDetails.tps_width_mm}mm`]);
            
            if (formatDetails.tps_depth_mm) {
              formatSpecsData.push(["Depth", `${formatDetails.tps_depth_mm}mm`]);
            }
          }
          
          if (formatDetails.tps_plc_height_mm && formatDetails.tps_plc_width_mm) {
            formatSpecsData.push(["PLC Dimensions (HxW)", `${formatDetails.tps_plc_height_mm}mm × ${formatDetails.tps_plc_width_mm}mm`]);
            
            if (formatDetails.tps_plc_depth_mm) {
              formatSpecsData.push(["PLC Depth", `${formatDetails.tps_plc_depth_mm}mm`]);
            }
          }
          
          if (formatDetails.extent) {
            formatSpecsData.push(["Extent", formatDetails.extent]);
          }
          
          if ('binding_type' in formatDetails && formatDetails.binding_type) {
            formatSpecsData.push(["Binding", String(formatDetails.binding_type)]);
          }
          
          if (formatDetails.cover_stock_print) {
            formatSpecsData.push(["Cover", formatDetails.cover_stock_print]);
          }
          
          if (formatDetails.internal_stock_print) {
            formatSpecsData.push(["Internal", formatDetails.internal_stock_print]);
          }
          
          if (formatSpecsData.length > 0) {
            // @ts-ignore
            doc.autoTable({
              startY: currentY,
              head: [["Specification", "Value"]],
              body: formatSpecsData,
              theme: 'grid',
              headStyles: { fillColor: [120, 144, 240] },
              margin: { left: 20 }
            });
            
            currentY = (doc as any).lastAutoTable.finalY + 5;
          }
        }
        
        // Fetch products for this format
        const formatProducts = await getFormatProducts(format.id);
        // Fetch price breaks for this format
        const priceBreaks = await getPriceBreaks(format.id);
        
        if (priceBreaks && priceBreaks.length > 0 && formatProducts && formatProducts.length > 0) {
          doc.setFontSize(10);
          doc.text("Price Breaks", 14, currentY);
          currentY += 5;
          
          // Create headers with product titles
          const headers = ["Quantity"];
          formatProducts.forEach(product => {
            headers.push(product.products?.title || `Product ${product.product_id.substring(0, 5)}`);
          });
          
          // Create rows for each price break
          const priceBreaksData = priceBreaks.map(pb => {
            const row = [pb.quantity.toLocaleString()];
            // Add placeholder for unit price for each product
            formatProducts.forEach(() => {
              row.push("---"); // Placeholder for unit price
            });
            return row;
          });
          
          // @ts-ignore
          doc.autoTable({
            startY: currentY,
            head: [headers],
            body: priceBreaksData,
            theme: 'grid',
            headStyles: { fillColor: [120, 144, 240] },
            margin: { left: 20 }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 5;
        }
        
        // Add format notes if exists
        if (format.notes) {
          doc.setFontSize(10);
          doc.text(`Notes: ${format.notes}`, 14, currentY);
          currentY += 8;
        }
        
        // Add products table
        if (format.products && format.products.length > 0) {
          const productsData = format.products.map(product => [
            product.product_name || 'Unknown Product',
            product.quantity.toLocaleString()
          ]);
          
          // @ts-ignore
          doc.autoTable({
            startY: currentY,
            head: [["Product", "Quantity"]],
            body: productsData,
            theme: 'grid',
            headStyles: { fillColor: [120, 144, 240] }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 10;
        }
        
        // Add a bit of space between formats
        if (i < selectedRequest.formats.length - 1) {
          currentY += 5;
        }
        
        // Add new page if needed
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }
      }
    }
    
    // Add extra costs section if exists
    if (selectedRequest.extra_costs && selectedRequest.extra_costs.length > 0) {
      const lastY = (doc as any).lastAutoTable?.finalY || 150;
      
      doc.setFontSize(12);
      doc.text("Extra Costs", 14, lastY + 10);
      
      const extraCostsData = selectedRequest.extra_costs.map(cost => [
        cost.name,
        cost.description || '-',
        cost.unit_of_measure_name || '-'
      ]);
      
      // @ts-ignore
      doc.autoTable({
        startY: lastY + 15,
        head: [["Item", "Description", "Unit of Measure"]],
        body: extraCostsData,
        theme: 'grid',
        headStyles: { fillColor: [244, 67, 54] }
      });
    }
    
    // Add savings section if exists
    if (selectedRequest.savings && selectedRequest.savings.length > 0) {
      const lastY = (doc as any).lastAutoTable?.finalY || 180;
      
      doc.setFontSize(12);
      doc.text("Savings", 14, lastY + 10);
      
      const savingsData = selectedRequest.savings.map(saving => [
        saving.name,
        saving.description || '-',
        saving.unit_of_measure_name || '-'
      ]);
      
      // @ts-ignore
      doc.autoTable({
        startY: lastY + 15,
        head: [["Item", "Description", "Unit of Measure"]],
        body: savingsData,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] }
      });
    }
    
    // Save the PDF
    doc.save(`Quote Request - ${selectedRequest.title}.pdf`);
    toast({ 
      title: "PDF Generated", 
      description: "The quote request has been downloaded as a PDF file" 
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast({ 
      title: "Error", 
      description: "Failed to generate PDF. Please try again.", 
      variant: "destructive" 
    });
  }
};
