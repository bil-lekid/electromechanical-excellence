-- Bounded catalog queries and substring search. Existing RLS remains in effect.
begin;
set local lock_timeout = '5s';
create extension if not exists pg_trgm with schema extensions;

alter table public.products add column if not exists search_text text
  generated always as (lower(name_id || ' ' || coalesce(brand, '') || ' ' || coalesce(sku, '') || ' ' || category)) stored;
create index if not exists products_search_trgm_idx on public.products
  using gin (search_text extensions.gin_trgm_ops) where is_active;
create index if not exists products_catalog_order_idx on public.products
  (is_featured desc nulls last, created_at desc, id) where is_active;
create index if not exists products_catalog_name_idx on public.products (name_id, id) where is_active;
create index if not exists products_catalog_price_idx on public.products (price_idr, id) where is_active;

create or replace function public.catalog_facets() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'categories', coalesce((select jsonb_agg(c.category order by c.category)
      from (select distinct category from public.products where is_active) c), '[]'::jsonb),
    'brands', coalesce((select jsonb_agg(jsonb_build_object('name', b.brand, 'count', b.count) order by b.brand)
      from (select brand, count(*) as count from public.products
        where is_active and brand is not null and brand <> '' group by brand) b), '[]'::jsonb)
  );
$$;
revoke all on function public.catalog_facets() from public;
grant execute on function public.catalog_facets() to anon, authenticated;
analyze public.products;
notify pgrst, 'reload schema';
commit;
