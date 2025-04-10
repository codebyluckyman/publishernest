
import { createSupplierQuote } from './createSupplierQuote';
import { deleteSupplierQuote } from './deleteSupplierQuote';
import { fetchSupplierQuotes } from './fetchSupplierQuotes';
import { updateSupplierQuote } from './updateSupplierQuote';
import { fetchSupplierQuoteById } from './fetchSupplierQuoteById';
import { submitSupplierQuote } from './submitSupplierQuote';
import { approveSupplierQuote } from './approveSupplierQuote';
import { rejectSupplierQuote } from './rejectSupplierQuote';
import { getAttachments } from './getAttachments';
import { getPublicUrl } from './getPublicUrls';

// Create an API object with all the functions
const api = {
  createSupplierQuote,
  deleteSupplierQuote,
  fetchSupplierQuotes,
  fetchSupplierQuoteById,
  updateSupplierQuote,
  submitSupplierQuote,
  approveSupplierQuote,
  rejectSupplierQuote,
  getAttachments,
  getPublicUrl
};

// Re-export all the functions individually
export {
  createSupplierQuote,
  deleteSupplierQuote,
  fetchSupplierQuotes,
  fetchSupplierQuoteById,
  updateSupplierQuote,
  submitSupplierQuote,
  approveSupplierQuote,
  rejectSupplierQuote,
  getAttachments,
  getPublicUrl
};

// Export the API object as well
export { api };
