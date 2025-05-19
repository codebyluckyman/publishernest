
import { fetchSalesPresentations } from './fetchSalesPresentations';
import { fetchSalesPresentationById } from './fetchSalesPresentationById';
import { createSalesPresentation } from './createSalesPresentation';
import { updateSalesPresentation } from './updateSalesPresentation';
import { deleteSalesPresentation } from './deleteSalesPresentation';
import { publishSalesPresentation } from './publishSalesPresentation';
import { createPresentationShare } from './createPresentationShare';
import { trackPresentationView } from './trackPresentationView';
import { 
  fetchPresentationSections,
  fetchPresentationItems, 
  createPresentationSection, 
  updatePresentationSection,
  deletePresentationSection,
  addPresentationItem,
  updatePresentationItem,
  deletePresentationItem
} from './presentationSections';

export {
  fetchSalesPresentations,
  fetchSalesPresentationById,
  createSalesPresentation,
  updateSalesPresentation,
  deleteSalesPresentation,
  publishSalesPresentation,
  createPresentationShare,
  trackPresentationView,
  // Presentation sections and items
  fetchPresentationSections,
  fetchPresentationItems,
  createPresentationSection,
  updatePresentationSection,
  deletePresentationSection,
  addPresentationItem,
  updatePresentationItem,
  deletePresentationItem
};
