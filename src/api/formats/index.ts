
import { supabase } from "@/integrations/supabase/client";
import { Format, FormatCategory } from "@/types/format";

export async function createFormat(formatData: Omit<Format, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("formats")
      .insert(formatData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating format:", error);
    throw error;
  }
}

export async function updateFormat(id: string, data: Partial<Format>) {
  try {
    const { data: updatedData, error } = await supabase
      .from("formats")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedData;
  } catch (error: any) {
    console.error("Error updating format:", error);
    throw error;
  }
}

export async function deleteFormat(id: string) {
  try {
    const { error } = await supabase
      .from("formats")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting format:", error);
    throw error;
  }
}

export async function createFormatCategory(categoryData: { name: string; organization_id: string }) {
  try {
    const { data, error } = await supabase
      .from("format_categories")
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating format category:", error);
    throw error;
  }
}

export async function updateFormatCategory(id: string, name: string) {
  try {
    const { data, error } = await supabase
      .from("format_categories")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error updating format category:", error);
    throw error;
  }
}

export async function deleteFormatCategory(id: string) {
  try {
    const { error } = await supabase
      .from("format_categories")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting format category:", error);
    throw error;
  }
}
