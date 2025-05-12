
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PresentationSection, PresentationItem } from '@/types/salesPresentation';

export const fetchPresentationSections = async (presentationId: string): Promise<PresentationSection[]> => {
  try {
    const { data, error } = await supabaseCustom
      .from('presentation_sections')
      .select('*')
      .eq('presentation_id', presentationId)
      .order('section_order');

    if (error) {
      console.error('Error fetching presentation sections:', error);
      return [];
    }

    return data as PresentationSection[];
  } catch (error) {
    console.error('Failed to fetch presentation sections:', error);
    return [];
  }
};

export const fetchPresentationItems = async (sectionId: string): Promise<PresentationItem[]> => {
  try {
    const { data, error } = await supabaseCustom
      .from('presentation_items')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order');

    if (error) {
      console.error('Error fetching presentation items:', error);
      return [];
    }

    return data as PresentationItem[];
  } catch (error) {
    console.error('Failed to fetch presentation items:', error);
    return [];
  }
};

export const createPresentationSection = async (
  presentationId: string, 
  sectionData: {
    title: string;
    description?: string;
    section_type: string;
    content?: any;
    section_order: number;
  }
): Promise<string | null> => {
  try {
    const { data, error } = await supabaseCustom
      .from('presentation_sections')
      .insert({
        presentation_id: presentationId,
        title: sectionData.title,
        description: sectionData.description,
        section_type: sectionData.section_type,
        content: sectionData.content,
        section_order: sectionData.section_order
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating presentation section:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create presentation section:', error);
    return null;
  }
};

export const updatePresentationSection = async (
  sectionId: string,
  sectionData: {
    title?: string;
    description?: string;
    content?: any;
    section_order?: number;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabaseCustom
      .from('presentation_sections')
      .update(sectionData)
      .eq('id', sectionId);

    if (error) {
      console.error('Error updating presentation section:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update presentation section:', error);
    return false;
  }
};

export const deletePresentationSection = async (sectionId: string): Promise<boolean> => {
  try {
    // First delete all items in this section
    const { error: itemsError } = await supabaseCustom
      .from('presentation_items')
      .delete()
      .eq('section_id', sectionId);

    if (itemsError) {
      console.error('Error deleting presentation items:', itemsError);
      return false;
    }

    // Then delete the section
    const { error } = await supabaseCustom
      .from('presentation_sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      console.error('Error deleting presentation section:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete presentation section:', error);
    return false;
  }
};

export const addPresentationItem = async (
  sectionId: string,
  itemData: {
    item_type: string;
    item_id?: string;
    title?: string;
    description?: string;
    custom_price?: number;
    currency?: string;
    custom_content?: any;
    display_order: number;
  }
): Promise<string | null> => {
  try {
    const { data, error } = await supabaseCustom
      .from('presentation_items')
      .insert({
        section_id: sectionId,
        item_type: itemData.item_type,
        item_id: itemData.item_id,
        title: itemData.title,
        description: itemData.description,
        custom_price: itemData.custom_price,
        currency: itemData.currency,
        custom_content: itemData.custom_content,
        display_order: itemData.display_order
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating presentation item:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create presentation item:', error);
    return null;
  }
};

export const updatePresentationItem = async (
  itemId: string,
  itemData: {
    title?: string;
    description?: string;
    custom_price?: number;
    currency?: string;
    custom_content?: any;
    display_order?: number;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabaseCustom
      .from('presentation_items')
      .update(itemData)
      .eq('id', itemId);

    if (error) {
      console.error('Error updating presentation item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update presentation item:', error);
    return false;
  }
};

export const deletePresentationItem = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseCustom
      .from('presentation_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting presentation item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete presentation item:', error);
    return false;
  }
};
