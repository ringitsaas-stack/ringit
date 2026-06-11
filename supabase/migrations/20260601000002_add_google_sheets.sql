-- Add google_sheet_url column to public.agents table
ALTER TABLE public.agents 
ADD COLUMN google_sheet_url TEXT;
