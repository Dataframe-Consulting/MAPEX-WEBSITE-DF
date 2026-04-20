-- ============================================================
-- MAPEX Storage Buckets
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Admins pueden subir, actualizar y eliminar imágenes
create policy "Admins pueden subir imágenes de productos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'productos' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins pueden actualizar imágenes de productos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'productos' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins pueden eliminar imágenes de productos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'productos' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Cualquiera puede ver las imágenes (bucket público)
create policy "Imágenes de productos son públicas"
  on storage.objects for select
  using (bucket_id = 'productos');
