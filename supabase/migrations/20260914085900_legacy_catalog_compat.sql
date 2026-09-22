-- Support projects whose original catalog used title/description.
-- No-op for projects already using name_id/name_en.
begin;
do $migration$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='products' and column_name='title')
     and not exists (select 1 from information_schema.columns
                     where table_schema='public' and table_name='products' and column_name='name_id') then
    alter table public.products
      add column name_id text,
      add column name_en text not null default '',
      add column description_id text,
      add column description_en text,
      add column brand text,
      add column is_featured boolean not null default false;
    update public.products set name_id=title, description_id=description;
    alter table public.products alter column name_id set not null;
    -- Both older editors and the storefront can continue writing product names.
    execute $function$
      create function public.sync_product_catalog_names() returns trigger
      language plpgsql set search_path = '' as $body$
      begin
        if TG_OP = 'INSERT' then
          NEW.name_id := coalesce(NEW.name_id, NEW.title);
          NEW.title := coalesce(NEW.title, NEW.name_id);
          NEW.description_id := coalesce(NEW.description_id, NEW.description);
          NEW.description := coalesce(NEW.description, NEW.description_id, '');
        else
          if NEW.name_id is distinct from OLD.name_id then NEW.title := NEW.name_id;
          elsif NEW.title is distinct from OLD.title then NEW.name_id := NEW.title;
          end if;
          if NEW.description_id is distinct from OLD.description_id then NEW.description := coalesce(NEW.description_id, '');
          elsif NEW.description is distinct from OLD.description then NEW.description_id := NEW.description;
          end if;
        end if;
        return NEW;
      end $body$
    $function$;
    create trigger sync_product_catalog_names before insert or update on public.products
      for each row execute function public.sync_product_catalog_names();
  end if;
end $migration$;
commit;
