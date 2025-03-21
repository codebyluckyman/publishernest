
import React, { useState, useRef } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { DetailHeader } from "./DetailHeader";
import { BasicInfo } from "./BasicInfo";
import { FormatAccordion } from "./FormatAccordion";
import { StatusActions } from "./StatusActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { toast } from "@/components/ui/use-toast";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { supabase } from "@/integrations/supabase/client";
import { Format } from "@/components/format/types/FormatTypes";
import { useOrganization } from "@/context/OrganizationContext";

interface QuoteDetailsProps {
  selectedRequest: QuoteRequest;
  onEdit?: (request: QuoteRequest) => void;
  onStatusChange?: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onShowHistory: () => void;
}

export function QuoteDetails({ 
  selectedRequest, 
  onEdit, 
  onStatusChange, 
  onShowHistory 
}: QuoteDetailsProps) {
  const [isExtraCostsOpen, setIsExtraCostsOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { currentOrganization } = useOrganization();
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedRequest);
    }
  };

  const handleStatusChange = (status: 'approved' | 'declined' | 'pending') => {
    if (onStatusChange) {
      onStatusChange(selectedRequest.id, status);
    }
  };

  // Handle print to PDF using react-to-print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Quote Request - ${selectedRequest.title}`,
    onAfterPrint: () => toast({ 
      title: "Print completed", 
      description: "The quote has been sent to the printer or saved as PDF" 
    }),
  });

  // Fetch format details directly from the database
  const getFormatDetails = async (formatId: string): Promise<Format | null> => {
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

  // Alternative PDF generation using jsPDF
  const generatePDF = async () => {
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
        ["Requested on", new Date(selectedRequest.requested_at).toLocaleDateString()],
        ["Due date", selectedRequest.due_date ? new Date(selectedRequest.due_date).toLocaleDateString() : "Not specified"],
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

  return (
    <div className="space-y-6 py-6" ref={printRef}>
      <DetailHeader 
        request={selectedRequest} 
        onEdit={onEdit ? handleEdit : undefined}
        onShowHistory={onShowHistory}
        onPrint={generatePDF}
      />

      <BasicInfo request={selectedRequest} />

      {selectedRequest.description && (
        <div>
          <h3 className="text-md font-medium mb-2">Description</h3>
          <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
        </div>
      )}

      {/* Format and Product Details */}
      {selectedRequest.formats && selectedRequest.formats.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Format & Product Details</h3>
          <FormatAccordion formats={selectedRequest.formats} />
        </div>
      )}

      {/* Extra Costs */}
      {selectedRequest.extra_costs && selectedRequest.extra_costs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium">Extra Costs</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => setIsExtraCostsOpen(!isExtraCostsOpen)}
            >
              {isExtraCostsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isExtraCostsOpen} onOpenChange={setIsExtraCostsOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 font-medium text-sm">Item</th>
                        <th className="py-2 font-medium text-sm">Description</th>
                        <th className="py-2 font-medium text-sm text-right">Unit of Measure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.extra_costs.map((cost, index) => (
                        <tr key={cost.id || index} className="border-b">
                          <td className="py-2 text-sm">{cost.name}</td>
                          <td className="py-2 text-sm text-muted-foreground">
                            {cost.description || '-'}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {cost.unit_of_measure_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
      
      {/* Savings */}
      {selectedRequest.savings && selectedRequest.savings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium">Savings</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => setIsSavingsOpen(!isSavingsOpen)}
            >
              {isSavingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isSavingsOpen} onOpenChange={setIsSavingsOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 font-medium text-sm">Item</th>
                        <th className="py-2 font-medium text-sm">Description</th>
                        <th className="py-2 font-medium text-sm text-right">Unit of Measure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.savings.map((saving, index) => (
                        <tr key={saving.id || index} className="border-b">
                          <td className="py-2 text-sm">{saving.name}</td>
                          <td className="py-2 text-sm text-muted-foreground">
                            {saving.description || '-'}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {saving.unit_of_measure_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {onStatusChange && (
        <StatusActions 
          status={selectedRequest.status} 
          onStatusChange={handleStatusChange} 
        />
      )}
    </div>
  );
}
