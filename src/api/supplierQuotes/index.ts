
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

export const api = {
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
