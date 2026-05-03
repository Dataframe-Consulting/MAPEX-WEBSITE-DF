-- ============================================================
-- FIX: infinite recursion in profiles RLS policies
--
-- Root cause: "Admins ven todos los perfiles" queries public.profiles
-- to check role='admin', which triggers the same RLS policy → loop.
--
-- Solution: a SECURITY DEFINER function that bypasses RLS, used by
-- every admin-check policy across all tables.
-- ============================================================

-- 1. Helper function — runs as owner (postgres), bypasses RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Grant execute to authenticated users
grant execute on function public.is_admin() to authenticated;


-- ============================================================
-- 2. Rebuild profiles policies
-- ============================================================
drop policy if exists "Admins ven todos los perfiles" on public.profiles;

create policy "Admins ven todos los perfiles"
  on public.profiles for select
  using (public.is_admin());


-- ============================================================
-- 3. Rebuild brands policies
-- ============================================================
drop policy if exists "Admins gestionan marcas" on public.brands;

create policy "Admins gestionan marcas"
  on public.brands for all
  using (public.is_admin());


-- ============================================================
-- 4. Rebuild categories policies
-- ============================================================
drop policy if exists "Admins gestionan categorías" on public.categories;

create policy "Admins gestionan categorías"
  on public.categories for all
  using (public.is_admin());


-- ============================================================
-- 5. Rebuild products policies
-- ============================================================
drop policy if exists "Admins ven todos los productos" on public.products;
drop policy if exists "Admins gestionan productos"     on public.products;

create policy "Admins ven todos los productos"
  on public.products for select
  using (public.is_admin());

create policy "Admins gestionan productos"
  on public.products for all
  using (public.is_admin());


-- ============================================================
-- 6. Rebuild product_variants policies
-- ============================================================
drop policy if exists "Admins gestionan variantes" on public.product_variants;

create policy "Admins gestionan variantes"
  on public.product_variants for all
  using (public.is_admin());


-- ============================================================
-- 7. Rebuild product_images policies
-- ============================================================
drop policy if exists "Admins gestionan imágenes" on public.product_images;

create policy "Admins gestionan imágenes"
  on public.product_images for all
  using (public.is_admin());


-- ============================================================
-- 8. Rebuild addresses policies
-- ============================================================
drop policy if exists "Admins ven todas las direcciones" on public.addresses;

create policy "Admins ven todas las direcciones"
  on public.addresses for select
  using (public.is_admin());


-- ============================================================
-- 9. Rebuild orders policies
-- ============================================================
drop policy if exists "Admins gestionan todos los pedidos" on public.orders;

create policy "Admins gestionan todos los pedidos"
  on public.orders for all
  using (public.is_admin());


-- ============================================================
-- 10. Rebuild order_items policies
-- ============================================================
drop policy if exists "Admins gestionan items de pedidos" on public.order_items;

create policy "Admins gestionan items de pedidos"
  on public.order_items for all
  using (public.is_admin());


-- ============================================================
-- 11. Rebuild contact_messages policies
-- ============================================================
drop policy if exists "Admins leen mensajes" on public.contact_messages;

create policy "Admins leen mensajes"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());


-- ============================================================
-- 12. Rebuild storage.objects admin policies
-- ============================================================
drop policy if exists "Admins pueden subir imágenes de productos"       on storage.objects;
drop policy if exists "Admins pueden actualizar imágenes de productos"  on storage.objects;
drop policy if exists "Admins pueden eliminar imágenes de productos"    on storage.objects;

create policy "Admins pueden subir imágenes de productos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos' and public.is_admin());

create policy "Admins pueden actualizar imágenes de productos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos' and public.is_admin());

create policy "Admins pueden eliminar imágenes de productos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos' and public.is_admin());
