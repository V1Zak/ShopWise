-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "product_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- Allow public read access
create policy "product_images_select" on storage.objects
  for select using (bucket_id = 'product-images');

-- Allow owners to update their uploads
create policy "product_images_update" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );
