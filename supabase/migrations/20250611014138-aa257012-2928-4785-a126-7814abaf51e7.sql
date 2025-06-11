
-- Add tags column to publishing_programs table
ALTER TABLE public.publishing_programs 
ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;

-- Add a comment to document the structure
COMMENT ON COLUMN public.publishing_programs.tags IS 'Array of tag objects with name and color properties, e.g. [{"name": "children''s books", "color": "green"}]';
