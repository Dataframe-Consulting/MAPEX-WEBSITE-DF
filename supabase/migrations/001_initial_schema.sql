-- ============================================================
-- MAPEX E-Commerce Database Schema
-- Migración inicial completa
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- PERFILES DE USUARIO
-- ============================================================
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  phone         text,
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Perfil extendido de usuarios registrados';

-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- MARCAS
-- ============================================================
create table public.brands (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  logo_url      text,
  website_url   text,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.brands is 'Marcas de productos (Sherwin Williams, Boden, etc.)';

-- Datos iniciales de marcas
insert into public.brands (name, slug, description, is_featured) values
  ('Sherwin Williams', 'sherwin-williams', 'Líder mundial en pinturas y recubrimientos. Distribuidores oficiales en Hermosillo.', true),
  ('Boden', 'boden', 'Marca nacional de alta calidad con amplia gama de pinturas, esmaltes e impermeabilizantes.', true);


-- ============================================================
-- CATEGORÍAS
-- ============================================================
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  parent_id     uuid references public.categories(id) on delete set null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on table public.categories is 'Categorías jerárquicas de productos';

-- Datos iniciales de categorías
insert into public.categories (name, slug, description, sort_order) values
  ('Pinturas de Interior', 'pinturas-interiores', 'Pinturas vinílicas y especiales para interiores del hogar', 1),
  ('Pinturas de Exterior', 'pinturas-exteriores', 'Pinturas con protección UV para fachadas y exteriores', 2),
  ('Impermeabilizantes', 'impermeabilizantes', 'Impermeabilizantes para techos, muros y superficies expuestas', 3),
  ('Esmaltes', 'esmaltes', 'Esmaltes brillantes y satinados para madera y metal', 4),
  ('Recubrimientos Especiales', 'recubrimientos', 'Recubrimientos de alta resistencia para usos industriales y especiales', 5),
  ('Accesorios y Herramientas', 'accesorios', 'Rodillos, brochas, bandeja, lija, cinta y todo para pintar', 6),
  ('Primers y Selladores', 'primers', 'Selladores, fijadores y fondos preparadores de superficie', 7),
  ('Texturas y Decorativos', 'texturas', 'Acabados decorativos, estuco veneciano y texturas', 8);


-- ============================================================
-- PRODUCTOS
-- ============================================================
create table public.products (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique,
  description             text,
  short_description       text,
  sku                     text unique,
  category_id             uuid references public.categories(id) on delete set null,
  brand_id                uuid references public.brands(id) on delete set null,
  base_price              decimal(10, 2) not null check (base_price >= 0),
  compare_price           decimal(10, 2) check (compare_price >= 0),
  image_url               text,
  is_featured             boolean not null default false,
  is_active               boolean not null default true,
  -- Atributos específicos de pintura
  finish                  text check (finish in ('flat','matte','eggshell','satin','semi-gloss','gloss','high-gloss')),
  base_type               text check (base_type in ('water','oil','epoxy','latex','acrylic')),
  coverage_sqm_per_liter  decimal(5, 2),
  dry_time_hours          decimal(4, 1),
  coats_required          smallint default 2,
  tags                    text[],
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.products is 'Catálogo de productos de MAPEX';

-- Trigger: actualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- VARIANTES DE PRODUCTO (tamaños, presentaciones)
-- ============================================================
create table public.product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  name          text not null,                     -- Ej: "1L", "4L", "19L"
  price         decimal(10, 2) not null check (price >= 0),
  compare_price decimal(10, 2) check (compare_price >= 0),
  stock         integer not null default 0 check (stock >= 0),
  sku           text unique,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

comment on table public.product_variants is 'Variantes de productos (tamaños, presentaciones, litros)';


-- ============================================================
-- IMÁGENES DE PRODUCTO
-- ============================================================
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  url           text not null,
  alt           text,
  is_primary    boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on table public.product_images is 'Galería de imágenes por producto';


-- ============================================================
-- DIRECCIONES
-- ============================================================
create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  full_name     text not null,
  phone         text not null,
  street        text not null,
  colonia       text not null,
  city          text not null default 'Hermosillo',
  state         text not null default 'Sonora',
  zip           text not null,
  address_notes text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.addresses is 'Direcciones de entrega de usuarios';


-- ============================================================
-- CARRITO (persistente en servidor para usuarios autenticados)
-- ============================================================
create table public.cart_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  variant_id    uuid not null references public.product_variants(id) on delete cascade,
  quantity      integer not null default 1 check (quantity > 0),
  created_at    timestamptz not null default now(),
  unique(user_id, variant_id)
);

comment on table public.cart_items is 'Carrito de compras persistente por usuario';


-- ============================================================
-- PEDIDOS
-- ============================================================
create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete restrict,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','preparing','delivering','delivered','cancelled')),
  subtotal      decimal(10, 2) not null check (subtotal >= 0),
  delivery_fee  decimal(10, 2) not null default 0 check (delivery_fee >= 0),
  total         decimal(10, 2) not null check (total >= 0),
  address_id    uuid references public.addresses(id) on delete set null,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.orders is 'Pedidos de compra realizados por usuarios';

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- ITEMS DE PEDIDO
-- ============================================================
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  variant_id    uuid references public.product_variants(id) on delete set null,
  product_name  text not null,
  variant_name  text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    decimal(10, 2) not null check (unit_price >= 0),
  total         decimal(10, 2) not null check (total >= 0)
);

comment on table public.order_items is 'Productos incluidos en cada pedido';


-- ============================================================
-- ÍNDICES para consultas frecuentes
-- ============================================================
create index idx_products_is_active     on public.products(is_active);
create index idx_products_is_featured   on public.products(is_featured);
create index idx_products_category_id   on public.products(category_id);
create index idx_products_brand_id      on public.products(brand_id);
create index idx_products_slug          on public.products(slug);
create index idx_variants_product_id    on public.product_variants(product_id);
create index idx_images_product_id      on public.product_images(product_id);
create index idx_orders_user_id         on public.orders(user_id);
create index idx_orders_status          on public.orders(status);
create index idx_orders_created_at      on public.orders(created_at desc);
create index idx_cart_user_id           on public.cart_items(user_id);
create index idx_addresses_user_id      on public.addresses(user_id);
create index idx_order_items_order_id   on public.order_items(order_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table public.profiles       enable row level security;
alter table public.brands          enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images  enable row level security;
alter table public.addresses       enable row level security;
alter table public.cart_items      enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;


-- ============================================================
-- POLICIES: Perfiles
-- ============================================================
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan su perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins ven todos los perfiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ============================================================
-- POLICIES: Marcas y Categorías (público lectura, admin escritura)
-- ============================================================
create policy "Todos ven marcas"
  on public.brands for select using (true);

create policy "Admins gestionan marcas"
  on public.brands for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Todos ven categorías"
  on public.categories for select using (true);

create policy "Admins gestionan categorías"
  on public.categories for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- POLICIES: Productos
-- ============================================================
create policy "Todos ven productos activos"
  on public.products for select
  using (is_active = true);

create policy "Admins ven todos los productos"
  on public.products for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins gestionan productos"
  on public.products for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Todos ven variantes activas"
  on public.product_variants for select
  using (
    is_active = true and
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );

create policy "Admins gestionan variantes"
  on public.product_variants for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Todos ven imágenes de productos activos"
  on public.product_images for select
  using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );

create policy "Admins gestionan imágenes"
  on public.product_images for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- POLICIES: Direcciones
-- ============================================================
create policy "Usuarios gestionan sus direcciones"
  on public.addresses for all
  using (auth.uid() = user_id);

create policy "Admins ven todas las direcciones"
  on public.addresses for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- POLICIES: Carrito
-- ============================================================
create policy "Usuarios gestionan su carrito"
  on public.cart_items for all
  using (auth.uid() = user_id);


-- ============================================================
-- POLICIES: Pedidos
-- ============================================================
create policy "Usuarios ven sus pedidos"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Usuarios crean pedidos"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins gestionan todos los pedidos"
  on public.orders for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Usuarios ven items de sus pedidos"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "Usuarios crean items de sus pedidos"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "Admins gestionan items de pedidos"
  on public.order_items for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- VISTA: Resumen de productos con stock total
-- ============================================================
create or replace view public.products_summary as
select
  p.id,
  p.name,
  p.slug,
  p.base_price,
  p.image_url,
  p.is_featured,
  p.is_active,
  p.finish,
  c.name as category_name,
  b.name as brand_name,
  count(v.id) as variant_count,
  coalesce(sum(v.stock), 0) as total_stock,
  min(v.price) as min_price,
  max(v.price) as max_price
from public.products p
left join public.categories c on c.id = p.category_id
left join public.brands b on b.id = p.brand_id
left join public.product_variants v on v.product_id = p.id and v.is_active = true
where p.is_active = true
group by p.id, p.name, p.slug, p.base_price, p.image_url, p.is_featured, p.is_active, p.finish, c.name, b.name;


-- ============================================================
-- DATOS INICIALES: Crear primer administrador
-- ============================================================
-- Para hacer admin a un usuario, ejecuta manualmente:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- O en el dashboard de Supabase, edita el campo role a 'admin'.


-- ============================================================
-- FUNCIÓN: Buscar productos con texto libre
-- ============================================================
create or replace function public.search_products(search_term text)
returns setof public.products language sql stable as $$
  select * from public.products
  where is_active = true
    and (
      name ilike '%' || search_term || '%'
      or description ilike '%' || search_term || '%'
      or sku ilike '%' || search_term || '%'
    )
  order by is_featured desc, created_at desc;
$$;
