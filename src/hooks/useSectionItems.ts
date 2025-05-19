
import { useQuery } from '@tanstack/react-query';
import { fetchPresentationItems } from '@/api/salesPresentations/presentationSections';
import { PresentationItem } from '@/types/salesPresentation';

export function useSectionItems(sectionIds: string[]) {
  return useQuery({
    queryKey: ['presentation-items', sectionIds],
    queryFn: async () => {
      if (sectionIds.length === 0) return new Map<string, PresentationItem[]>();
      
      const itemsPromises = sectionIds.map(sectionId => fetchPresentationItems(sectionId));
      const itemsResults = await Promise.all(itemsPromises);
      
      // Create a map of sectionId -> items[]
      const itemsBySection = new Map<string, PresentationItem[]>();
      sectionIds.forEach((sectionId, index) => {
        itemsBySection.set(sectionId, itemsResults[index]);
      });
      
      return itemsBySection;
    },
    enabled: sectionIds.length > 0
  });
}
