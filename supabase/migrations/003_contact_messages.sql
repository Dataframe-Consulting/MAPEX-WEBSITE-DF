create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  email       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.contact_messages is 'Mensajes del formulario de contacto';

alter table public.contact_messages enable row level security;

-- Solo admins pueden leer mensajes
create policy "Admins leen mensajes"
  on public.contact_messages for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Cualquiera puede enviar un mensaje
create policy "Cualquiera puede enviar mensaje"
  on public.contact_messages for insert
  with check (true);
