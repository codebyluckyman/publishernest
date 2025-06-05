
import { createSupplierQuote } from './createSupplierQuote';
import { deleteSupplierQuote } from './deleteSupplierQuote';
import { fetchSupplierQuotes } from './fetchSupplierQuotes';
import { fetchSupplierQuotesComparison } from './fetchSupplierQuotesComparison';
import { updateSupplierQuote } from './updateSupplierQuote';
import { fetchSupplierQuoteById } from './fetchSupplierQuoteById';
import { submitSupplierQuote } from './submitSupplierQuote';
import { approveSupplierQuote } from './approveSupplierQuote';
import { rejectSupplierQuote } from './rejectSupplierQuote';
import { getAttachments, getSupplierQuoteAttachments } from './getAttachments';
import { getPublicUrl } from './getPublicUrls';
import { fetchSupplierQuoteAudit, recordSupplierQuoteAudit } from './supplierQuoteAudit';
import { acceptSupplierQuote, declineSupplierQuote } from './supplierQuoteStatusUpdate';
import { sendSupplierQuoteApprovalNotifications } from './sendSupplierQuoteApprovalNotifications';

// Create an API object with all the functions
const api = {
  createSupplierQuote,
  deleteSupplierQuote,
  fetchSupplierQuotes,
  fetchSupplierQuotesComparison,
  fetchSupplierQuoteById,
  updateSupplierQuote,
  submitSupplierQuote,
  approveSupplierQuote,
  rejectSupplierQuote,
  acceptSupplierQuote,
  declineSupplierQuote,
  getAttachments,
  getSupplierQuoteAttachments,
  getPublicUrl,
  fetchSupplierQuoteAudit,
  recordSupplierQuoteAudit,
  sendSupplierQuoteApprovalNotifications
};

// Re-export all the functions individually
export {
  createSupplierQuote,
  deleteSupplierQuote,
  fetchSupplierQuotes,
  fetchSupplierQuotesComparison,
  fetchSupplierQuoteById,
  updateSupplierQuote,
  submitSupplierQuote,
  approveSupplierQuote,
  rejectSupplierQuote,
  acceptSupplierQuote,
  declineSupplierQuote,
  getAttachments,
  getSupplierQuoteAttachments,
  getPublicUrl,
  fetchSupplierQuoteAudit,
  recordSupplierQuoteAudit,
  sendSupplierQuoteApprovalNotifications
};

// Export the API object as well
export { api };
