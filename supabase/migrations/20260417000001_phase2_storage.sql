-- Phase 2: Supabase Storage bucket for card scan images

-- Create the card-images bucket (private by default)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-images',
  'card-images',
  false,
  10485760,  -- 10 MB limit per image
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Authenticated users can upload images into their own user folder
create policy "Users can upload their own card images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own card images
create policy "Users can read their own card images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own card images
create policy "Users can delete their own card images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
