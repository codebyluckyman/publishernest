
-- Create table for publishing program tag library
CREATE TABLE public.publishing_program_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('green', 'blue', 'purple', 'orange', 'red', 'yellow', 'pink', 'gray')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name, color)
);

-- Add Row Level Security
ALTER TABLE public.publishing_program_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for organization members to view tags
CREATE POLICY "Organization members can view publishing program tags" 
  ON public.publishing_program_tags 
  FOR SELECT 
  USING (organization_id IN (SELECT public.get_user_organizations()));

-- Create policy for organization members to create tags
CREATE POLICY "Organization members can create publishing program tags" 
  ON public.publishing_program_tags 
  FOR INSERT 
  WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

-- Create policy for organization members to update tags
CREATE POLICY "Organization members can update publishing program tags" 
  ON public.publishing_program_tags 
  FOR UPDATE 
  USING (organization_id IN (SELECT public.get_user_organizations()));

-- Create policy for organization members to delete tags
CREATE POLICY "Organization members can delete publishing program tags" 
  ON public.publishing_program_tags 
  FOR DELETE 
  USING (organization_id IN (SELECT public.get_user_organizations()));

-- Add foreign key constraint
ALTER TABLE public.publishing_program_tags
ADD CONSTRAINT fk_publishing_program_tags_organization
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_publishing_program_tags_org_usage 
ON public.publishing_program_tags(organization_id, usage_count DESC);

-- Create function to increment tag usage
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.publishing_program_tags
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = tag_id;
END;
$$;
