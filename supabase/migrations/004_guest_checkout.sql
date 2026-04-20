-- Permitir compras sin cuenta (guest checkout)
alter table public.addresses alter column user_id drop not null;
alter table public.orders alter column user_id drop not null;

-- Actualizar RLS de orders para permitir inserts de anónimos
drop policy if exists "Usuarios ven sus pedidos" on public.orders;
drop policy if exists "Usuarios crean pedidos" on public.orders;

create policy "Cualquiera puede crear un pedido"
  on public.orders for insert
  with check (true);

create policy "Admins ven todos los pedidos"
  on public.orders for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins actualizan pedidos"
  on public.orders for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- RLS para addresses guest
drop policy if exists "Usuarios gestionan sus direcciones" on public.addresses;

create policy "Cualquiera puede crear una dirección"
  on public.addresses for insert
  with check (true);

-- RLS para order_items
drop policy if exists "Usuarios ven sus items" on public.order_items;
drop policy if exists "Usuarios crean items" on public.order_items;

create policy "Cualquiera puede crear order items"
  on public.order_items for insert
  with check (true);

create policy "Admins ven todos los items"
  on public.order_items for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
