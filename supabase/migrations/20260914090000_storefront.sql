-- Apply after the existing migrations. No sample products are inserted.
begin;

alter table public.products
  add column sku text unique,
  add column price_idr numeric(14,2) check (price_idr >= 0),
  add column unit text not null default 'pcs' check (length(unit) between 1 and 30),
  add column availability text not null default 'on_request'
    check (availability in ('ready', 'on_request', 'unavailable')),
  add column specifications jsonb not null default '{}'::jsonb
    check (jsonb_typeof(specifications) = 'object'),
  add column is_active boolean not null default true;

create index products_category_brand_idx on public.products(category, brand) where is_active;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Do not expose arbitrary users' roles through a SECURITY DEFINER RPC.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = ''
as $$ select _user_id = auth.uid() and exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = _role
) $$;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

drop policy "Products are viewable by everyone" on public.products;
create policy "Active products are public" on public.products for select to anon, authenticated using (is_active);
create policy "Admins can read all products" on public.products for select to authenticated using (public.is_admin());

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  request_token uuid not null,
  contact_name text not null check (length(contact_name) between 2 and 100),
  company text not null check (length(company) between 2 and 200),
  phone text not null check (length(phone) between 8 and 25),
  email text not null check (length(email) between 3 and 255),
  address text not null check (length(address) between 10 and 1000),
  notes text not null default '' check (length(notes) <= 2000),
  status text not null default 'submitted' check (status in ('submitted','reviewing','quoted','closed')),
  created_at timestamptz not null default now(),
  unique(user_id, request_token)
);
create index quote_requests_user_created_idx on public.quote_requests(user_id, created_at desc);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  sku text,
  unit text not null,
  quantity integer not null check (quantity between 1 and 9999),
  reference_price_idr numeric(14,2),
  unique(quote_id, product_id)
);

alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;
revoke all on public.quote_requests, public.quote_items from anon, authenticated;
grant select on public.quote_requests, public.quote_items to authenticated;
grant update(status) on public.quote_requests to authenticated;
create policy "Own requests or admin" on public.quote_requests for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admin request status" on public.quote_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Own request items or admin" on public.quote_items for select to authenticated
  using (exists (select 1 from public.quote_requests q where q.id = quote_id and (q.user_id = auth.uid() or public.is_admin())));

-- Atomic, idempotent submission. Product names and reference prices come from
-- the database; callers cannot supply owner, status, or price snapshots.
create function public.submit_quote(_token uuid, _contact jsonb, _items jsonb)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  result_id uuid;
  item jsonb;
  product public.products%rowtype;
  qty integer;
begin
  if caller is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(caller::text, 0));
  select id into result_id from public.quote_requests where user_id = caller and request_token = _token;
  if result_id is not null then return result_id; end if;
  if _token is null or _contact is null or jsonb_typeof(_contact) <> 'object'
    or _items is null or jsonb_typeof(_items) <> 'array' then raise exception 'Invalid request'; end if;
  if jsonb_array_length(_items) not between 1 and 100 then raise exception 'Choose 1 to 100 products'; end if;
  if exists (select 1 from public.quote_requests where user_id = caller and created_at > now() - interval '1 minute')
    or (select count(*) from public.quote_requests where user_id = caller and created_at > now() - interval '1 day') >= 20
    then raise exception 'Please wait before submitting another request'; end if;
  insert into public.quote_requests(user_id, request_token, contact_name, company, phone, email, address, notes)
  values (caller, _token, trim(_contact->>'name'), trim(_contact->>'company'), trim(_contact->>'phone'),
    (select email from auth.users where id = caller), trim(_contact->>'address'), trim(coalesce(_contact->>'notes','')))
  returning id into result_id;
  for item in select value from jsonb_array_elements(_items) loop
    if jsonb_typeof(item->'quantity') <> 'number' or (item->>'quantity') !~ '^[0-9]{1,4}$'
      then raise exception 'Invalid quantity'; end if;
    qty := (item->>'quantity')::integer;
    select * into product from public.products where id = (item->>'product_id')::uuid and is_active and availability <> 'unavailable' for share;
    if not found then raise exception 'Product is no longer available'; end if;
    insert into public.quote_items(quote_id, product_id, product_name, sku, unit, quantity, reference_price_idr)
    values (result_id, product.id, product.name_id, product.sku, product.unit, qty, product.price_idr);
  end loop;
  return result_id;
end $$;
revoke all on function public.submit_quote(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.submit_quote(uuid,jsonb,jsonb) to authenticated;
commit;
