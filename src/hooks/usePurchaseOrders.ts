
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PurchaseOrder, PurchaseOrderFormValues, PurchaseOrderLineItem, PurchaseOrderAudit } from "@/types/purchaseOrder";
import { useOrganization } from "@/context/OrganizationContext";

export function usePurchaseOrders() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  /**
   * Hook to fetch purchase orders
   */
  const usePurchaseOrdersList = (
    status?: string,
    supplierId?: string,
    printRunId?: string,
    searchQuery?: string
  ) => {
    return useQuery({
      queryKey: ["purchaseOrders", currentOrganization?.id, status, supplierId, printRunId, searchQuery],
      queryFn: async () => {
        if (!currentOrganization) return [];

        let query = supabase
          .from("purchase_orders")
          .select(`
            *,
            supplier:supplier_id (supplier_name),
            print_run:print_run_id (title, status)
          `)
          .eq("organization_id", currentOrganization.id);

        if (status) {
          query = query.eq("status", status);
        }

        if (supplierId) {
          query = query.eq("supplier_id", supplierId);
        }

        if (printRunId) {
          query = query.eq("print_run_id", printRunId);
        }

        if (searchQuery) {
          query = query.or(`po_number.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        return data as PurchaseOrder[];
      },
      enabled: !!currentOrganization,
    });
  };

  /**
   * Hook to fetch a specific purchase order by ID
   */
  const usePurchaseOrderById = (id: string | null) => {
    return useQuery({
      queryKey: ["purchaseOrder", id],
      queryFn: async () => {
        if (!id) throw new Error("Purchase order ID is required");

        // Fetch purchase order with related data
        const { data: purchaseOrder, error } = await supabase
          .from("purchase_orders")
          .select(`
            *,
            supplier:supplier_id (supplier_name),
            print_run:print_run_id (*)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        // Fetch line items
        const { data: lineItems, error: lineItemsError } = await supabase
          .from("purchase_order_line_items")
          .select(`
            *,
            product:product_id (title, isbn13),
            format:format_id (format_name)
          `)
          .eq("purchase_order_id", id);

        if (lineItemsError) throw lineItemsError;

        return {
          ...purchaseOrder,
          line_items: lineItems as PurchaseOrderLineItem[]
        } as PurchaseOrder;
      },
      enabled: !!id,
    });
  };

  /**
   * Hook to fetch purchase order audit history
   */
  const usePurchaseOrderAudit = (purchaseOrderId: string | null) => {
    return useQuery({
      queryKey: ["purchaseOrderAudit", purchaseOrderId],
      queryFn: async () => {
        if (!purchaseOrderId) return [];

        const { data, error } = await supabase
          .from("purchase_order_audit")
          .select(`
            *,
            changed_by_user:changed_by (email)
          `)
          .eq("purchase_order_id", purchaseOrderId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as PurchaseOrderAudit[];
      },
      enabled: !!purchaseOrderId,
    });
  };

  /**
   * Creates a purchase order and its line items
   */
  const useCreatePurchaseOrder = () => {
    return useMutation({
      mutationFn: async (formData: PurchaseOrderFormValues) => {
        if (!user || !currentOrganization) {
          throw new Error("User must be authenticated and organization selected");
        }

        // Start a transaction
        const { data: purchaseOrder, error: poError } = await supabase
          .from("purchase_orders")
          .insert({
            organization_id: currentOrganization.id,
            print_run_id: formData.print_run_id,
            supplier_id: formData.supplier_id,
            supplier_quote_id: formData.supplier_quote_id,
            status: "draft",
            issue_date: formData.issue_date ? new Date(formData.issue_date).toISOString().split('T')[0] : null,
            delivery_date: formData.delivery_date ? new Date(formData.delivery_date).toISOString().split('T')[0] : null,
            shipping_address: formData.shipping_address,
            shipping_method: formData.shipping_method,
            payment_terms: formData.payment_terms,
            currency: formData.currency || "USD",
            notes: formData.notes,
            created_by: user.id,
          })
          .select()
          .single();

        if (poError) throw poError;

        // Calculate line item costs and total amount
        let totalAmount = 0;

        // Process line items
        if (formData.line_items && formData.line_items.length > 0) {
          const lineItemsToInsert = [];

          for (const item of formData.line_items) {
            // If we have a supplier quote and format, try to get the unit cost from the price breaks
            let unitCost = 0;
            
            if (formData.supplier_quote_id && item.format_id) {
              // Call our database function to find the right price break
              const { data: priceData, error: priceError } = await supabase
                .rpc('get_price_break_for_quantity', {
                  p_supplier_quote_id: formData.supplier_quote_id,
                  p_format_id: item.format_id,
                  p_quantity: item.quantity
                });
                
              if (priceError) {
                console.error("Error getting price break:", priceError);
              } else if (priceData) {
                unitCost = priceData;
              }
            }
            
            // If no unit cost was found, maybe it's a draft or manually entered
            // In a real implementation, we might want to require this
            if (!unitCost) {
              unitCost = 0; // This would typically be provided by the form
            }
            
            const totalItemCost = unitCost * item.quantity;
            totalAmount += totalItemCost;
            
            lineItemsToInsert.push({
              purchase_order_id: purchaseOrder.id,
              product_id: item.product_id,
              format_id: item.format_id || null,
              quantity: item.quantity,
              unit_cost: unitCost,
              total_cost: totalItemCost
            });
          }

          // Insert all line items
          if (lineItemsToInsert.length > 0) {
            const { error: lineItemsError } = await supabase
              .from("purchase_order_line_items")
              .insert(lineItemsToInsert);

            if (lineItemsError) throw lineItemsError;
          }
        }

        // Update the purchase order with the total amount
        const { error: updateError } = await supabase
          .from("purchase_orders")
          .update({ total_amount: totalAmount })
          .eq("id", purchaseOrder.id);

        if (updateError) throw updateError;

        // Record the create action in the audit log
        const { error: auditError } = await supabase
          .rpc('record_purchase_order_audit', {
            p_purchase_order_id: purchaseOrder.id,
            p_changed_by: user.id,
            p_action: 'create',
            p_changes: {}
          });

        if (auditError) {
          console.error("Error recording audit:", auditError);
        }

        return purchaseOrder as PurchaseOrder;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        toast.success("Purchase order created successfully");
      },
      onError: (error: any) => {
        console.error("Error creating purchase order:", error);
        toast.error(error.message || "Failed to create purchase order");
      },
    });
  };

  /**
   * Updates a purchase order and its line items
   */
  const useUpdatePurchaseOrder = () => {
    return useMutation({
      mutationFn: async ({ 
        id, 
        updates, 
        previousData 
      }: { 
        id: string; 
        updates: Partial<PurchaseOrderFormValues>; 
        previousData: PurchaseOrder 
      }) => {
        if (!user) throw new Error("User must be authenticated");
        if (!id) throw new Error("Purchase order ID is required");

        // Track changes for audit
        const changes: Record<string, { previous: any; new: any }> = {};
        
        // Build update object
        const updateData: any = {};
        
        // Handle date fields separately
        if (updates.issue_date !== undefined) {
          const newDateStr = updates.issue_date ? new Date(updates.issue_date).toISOString().split('T')[0] : null;
          if (newDateStr !== previousData.issue_date) {
            updateData.issue_date = newDateStr;
            changes.issue_date = { previous: previousData.issue_date, new: newDateStr };
          }
        }
        
        if (updates.delivery_date !== undefined) {
          const newDateStr = updates.delivery_date ? new Date(updates.delivery_date).toISOString().split('T')[0] : null;
          if (newDateStr !== previousData.delivery_date) {
            updateData.delivery_date = newDateStr;
            changes.delivery_date = { previous: previousData.delivery_date, new: newDateStr };
          }
        }
        
        // Handle text/string fields
        const textFields = [
          'supplier_id', 'supplier_quote_id', 'shipping_address', 
          'shipping_method', 'payment_terms', 'currency', 'notes'
        ] as const;
        
        for (const field of textFields) {
          if (updates[field] !== undefined && updates[field] !== previousData[field]) {
            updateData[field] = updates[field];
            changes[field] = { previous: previousData[field], new: updates[field] };
          }
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from("purchase_orders")
            .update(updateData)
            .eq("id", id);
            
          if (updateError) throw updateError;
        }
        
        // Handle line items if provided
        if (updates.line_items) {
          // Get existing line items
          const { data: existingItems, error: fetchError } = await supabase
            .from("purchase_order_line_items")
            .select("*")
            .eq("purchase_order_id", id);
            
          if (fetchError) throw fetchError;
          
          // Delete all existing line items
          if (existingItems && existingItems.length > 0) {
            const { error: deleteError } = await supabase
              .from("purchase_order_line_items")
              .delete()
              .eq("purchase_order_id", id);
              
            if (deleteError) throw deleteError;
            
            // Record deleted items in changes
            changes.line_items_removed = { 
              previous: existingItems, 
              new: null 
            };
          }
          
          // Calculate line item costs and total amount
          let totalAmount = 0;
          const lineItemsToInsert = [];
          
          for (const item of updates.line_items) {
            // Similar logic to create function for getting unit costs
            let unitCost = 0;
            
            if (previousData.supplier_quote_id && item.format_id) {
              const { data: priceData, error: priceError } = await supabase
                .rpc('get_price_break_for_quantity', {
                  p_supplier_quote_id: previousData.supplier_quote_id,
                  p_format_id: item.format_id,
                  p_quantity: item.quantity
                });
                
              if (!priceError && priceData) {
                unitCost = priceData;
              }
            }
            
            const totalItemCost = unitCost * item.quantity;
            totalAmount += totalItemCost;
            
            lineItemsToInsert.push({
              purchase_order_id: id,
              product_id: item.product_id,
              format_id: item.format_id || null,
              quantity: item.quantity,
              unit_cost: unitCost,
              total_cost: totalItemCost
            });
          }
          
          // Insert new line items
          if (lineItemsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from("purchase_order_line_items")
              .insert(lineItemsToInsert);
              
            if (insertError) throw insertError;
            
            // Record new items in changes
            changes.line_items_added = { 
              previous: null, 
              new: lineItemsToInsert 
            };
          }
          
          // Update total amount
          if (totalAmount !== previousData.total_amount) {
            const { error: totalError } = await supabase
              .from("purchase_orders")
              .update({ total_amount: totalAmount })
              .eq("id", id);
              
            if (totalError) throw totalError;
            
            changes.total_amount = { 
              previous: previousData.total_amount, 
              new: totalAmount 
            };
          }
        }
        
        // Record the update in audit log if there were changes
        if (Object.keys(changes).length > 0) {
          const { error: auditError } = await supabase
            .rpc('record_purchase_order_audit', {
              p_purchase_order_id: id,
              p_changed_by: user.id,
              p_action: 'update',
              p_changes: changes
            });

          if (auditError) {
            console.error("Error recording audit:", auditError);
          }
        }

        // Fetch the updated purchase order
        const { data: updatedPO, error: fetchError } = await supabase
          .from("purchase_orders")
          .select(`
            *,
            supplier:supplier_id (supplier_name),
            print_run:print_run_id (*)
          `)
          .eq("id", id)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Fetch updated line items
        const { data: lineItems, error: lineItemsError } = await supabase
          .from("purchase_order_line_items")
          .select(`
            *,
            product:product_id (title, isbn13),
            format:format_id (format_name)
          `)
          .eq("purchase_order_id", id);

        if (lineItemsError) throw lineItemsError;

        return {
          ...updatedPO,
          line_items: lineItems as PurchaseOrderLineItem[]
        } as PurchaseOrder;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        queryClient.invalidateQueries({ queryKey: ["purchaseOrder", variables.id] });
        toast.success("Purchase order updated successfully");
      },
      onError: (error: any) => {
        console.error("Error updating purchase order:", error);
        toast.error(error.message || "Failed to update purchase order");
      },
    });
  };

  /**
   * Deletes a purchase order and its line items
   */
  const useDeletePurchaseOrder = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        if (!id) throw new Error("Purchase order ID is required");

        // No need to delete line items separately due to CASCADE constraint
        const { error } = await supabase
          .from("purchase_orders")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        toast.success("Purchase order deleted successfully");
      },
      onError: (error: any) => {
        console.error("Error deleting purchase order:", error);
        toast.error(error.message || "Failed to delete purchase order");
      },
    });
  };

  /**
   * Approves a purchase order
   */
  const useApprovePurchaseOrder = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        if (!user) throw new Error("User must be authenticated");
        if (!id) throw new Error("Purchase order ID is required");

        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from("purchase_orders")
          .update({
            status: "approved",
            approved_at: now,
            approved_by: user.id,
            updated_at: now
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Record the action in audit log
        const { error: auditError } = await supabase
          .rpc('record_purchase_order_audit', {
            p_purchase_order_id: id,
            p_changed_by: user.id,
            p_action: 'approve',
            p_changes: { 
              status: { previous: "draft", new: "approved" },
              approved_at: { previous: null, new: now },
              approved_by: { previous: null, new: user.id }
            }
          });

        if (auditError) {
          console.error("Error recording audit:", auditError);
        }

        return data as PurchaseOrder;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        queryClient.invalidateQueries({ queryKey: ["purchaseOrder", variables] });
        toast.success("Purchase order approved successfully");
      },
      onError: (error: any) => {
        console.error("Error approving purchase order:", error);
        toast.error(error.message || "Failed to approve purchase order");
      },
    });
  };

  /**
   * Cancels a purchase order
   */
  const useCancelPurchaseOrder = () => {
    return useMutation({
      mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
        if (!user) throw new Error("User must be authenticated");
        if (!id) throw new Error("Purchase order ID is required");

        const now = new Date().toISOString();
        
        // Get current status for audit
        const { data: currentPO, error: fetchError } = await supabase
          .from("purchase_orders")
          .select("status")
          .eq("id", id)
          .single();
          
        if (fetchError) throw fetchError;
        
        const previousStatus = currentPO.status;
        
        const { data, error } = await supabase
          .from("purchase_orders")
          .update({
            status: "cancelled",
            cancelled_at: now,
            cancelled_by: user.id,
            cancellation_reason: reason,
            updated_at: now
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Record the action in audit log
        const { error: auditError } = await supabase
          .rpc('record_purchase_order_audit', {
            p_purchase_order_id: id,
            p_changed_by: user.id,
            p_action: 'cancel',
            p_changes: { 
              status: { previous: previousStatus, new: "cancelled" },
              cancelled_at: { previous: null, new: now },
              cancelled_by: { previous: null, new: user.id },
              cancellation_reason: { previous: null, new: reason }
            }
          });

        if (auditError) {
          console.error("Error recording audit:", auditError);
        }

        return data as PurchaseOrder;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        queryClient.invalidateQueries({ queryKey: ["purchaseOrder", variables.id] });
        toast.success("Purchase order cancelled successfully");
      },
      onError: (error: any) => {
        console.error("Error cancelling purchase order:", error);
        toast.error(error.message || "Failed to cancel purchase order");
      },
    });
  };

  /**
   * Updates the status of a purchase order
   */
  const useUpdatePurchaseOrderStatus = () => {
    return useMutation({
      mutationFn: async ({ id, status }: { id: string; status: string }) => {
        if (!user) throw new Error("User must be authenticated");
        if (!id) throw new Error("Purchase order ID is required");

        // Get current status for audit
        const { data: currentPO, error: fetchError } = await supabase
          .from("purchase_orders")
          .select("status")
          .eq("id", id)
          .single();
          
        if (fetchError) throw fetchError;
        
        const previousStatus = currentPO.status;
        
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from("purchase_orders")
          .update({
            status,
            updated_at: now
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Record the status change in audit log
        const { error: auditError } = await supabase
          .rpc('record_purchase_order_audit', {
            p_purchase_order_id: id,
            p_changed_by: user.id,
            p_action: 'status_change',
            p_changes: { 
              status: { previous: previousStatus, new: status }
            }
          });

        if (auditError) {
          console.error("Error recording audit:", auditError);
        }

        return data as PurchaseOrder;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
        queryClient.invalidateQueries({ queryKey: ["purchaseOrder", variables.id] });
        toast.success(`Purchase order status updated to ${variables.status}`);
      },
      onError: (error: any) => {
        console.error("Error updating purchase order status:", error);
        toast.error(error.message || "Failed to update purchase order status");
      },
    });
  };

  return {
    usePurchaseOrdersList,
    usePurchaseOrderById,
    usePurchaseOrderAudit,
    useCreatePurchaseOrder,
    useUpdatePurchaseOrder,
    useDeletePurchaseOrder,
    useApprovePurchaseOrder,
    useCancelPurchaseOrder,
    useUpdatePurchaseOrderStatus,
  };
}
