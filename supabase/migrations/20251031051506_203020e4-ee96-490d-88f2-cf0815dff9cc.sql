-- Add video_url and file_urls columns to lessons table
ALTER TABLE public.lessons
ADD COLUMN video_url TEXT,
ADD COLUMN file_urls TEXT[];

-- Add some sample lesson data with videos
UPDATE public.lessons
SET 
  video_url = 'https://www.youtube.com/embed/aircAruvnKk',
  file_urls = ARRAY['https://example.com/files/lesson-notes.pdf', 'https://example.com/files/exercises.zip']
WHERE id IN (
  SELECT id FROM public.lessons LIMIT 3
);