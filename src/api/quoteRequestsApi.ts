
// This file re-exports all functionality from the new modular structure
// for backward compatibility

import {
  fetchQuoteRequests,
  createQuoteRequest,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
  fetchQuoteRequestAudit,
  recordQuoteRequestAudit
} from './quoteRequests';

export {
  fetchQuoteRequests,
  createQuoteRequest,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
  fetchQuoteRequestAudit,
  recordQuoteRequestAudit
};
