
// Export all supplier quote related API functions
export { fetchSupplierQuotes, fetchAllSupplierQuotes } from "./fetchSupplierQuotes";
export { fetchSupplierQuoteById } from "./fetchSupplierQuoteById";
export { createSupplierQuote } from "./createSupplierQuote";
export { updateSupplierQuote } from "./updateSupplierQuote";
export { submitSupplierQuote } from "./submitSupplierQuote";
export { deleteSupplierQuote } from "./deleteSupplierQuote";
export { acceptSupplierQuote } from "./acceptSupplierQuote";
export { declineSupplierQuote } from "./declineSupplierQuote";
export { approveSupplierQuote } from "./approveSupplierQuote";
export { rejectSupplierQuote } from "./rejectSupplierQuote";
export { getPublicUrl } from "./getPublicUrl";

// Export the API object for more specific functions
export const api = {
  fetchSupplierQuoteAudit: async (quoteId: string) => {
    // This is a placeholder, implement the actual function later
    return [];
  }
};

// Export the getAttachments function
export async function getAttachments(quoteId: string) {
  try {
    // This is a placeholder implementation
    // In a real application, you would fetch attachments from the database
    return [];
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }
}
