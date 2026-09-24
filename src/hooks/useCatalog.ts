import { useEffect } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { demoProducts, filterProducts, productSchema, Product } from '@/lib/store';

export const catalogDemo = import.meta.env.DEV && import.meta.env.VITE_CATALOG_DEMO === 'true';
export const PAGE_SIZE = 12;
// Exclude legacy duplicate fields and the indexed search document from responses.
const columns = 'id,name_id,name_en,description_id,description_en,category,brand,image_url,is_featured,created_at,updated_at,sku,price_idr,unit,availability,specifications,is_active';
const queryDefaults = { staleTime: 60_000, gcTime: 10 * 60_000, retry: 1, refetchOnWindowFocus: false };
const signalWithTimeout = (signal: AbortSignal) => AbortSignal.any([signal, AbortSignal.timeout(15_000)]);
const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
export type CatalogFilters = { query: string; category: string; brand: string; ready: boolean; sort: string; page: number };
const facetsSchema = z.object({ categories: z.array(z.string()), brands: z.array(z.object({ name: z.string(), count: z.number() })) });

async function getPage(filters: CatalogFilters, signal: AbortSignal) {
  const { query, category, brand, ready, sort, page } = filters;
  if (catalogDemo) {
    const rows = filterProducts(demoProducts, query, category, brand, ready, sort);
    return { products: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: rows.length };
  }
  let request = supabase.from('products').select(columns, { count: 'exact' }).eq('is_active', true);
  // Each term must match; values stay in query parameters, never PostgREST .or() syntax.
  for (const term of query.trim().slice(0, 150).split(/\s+/).filter(Boolean)) {
    // PostgREST treats * as a LIKE wildcard even when escaped. Use a literal
    // regex only for these terms so model numbers containing * remain searchable.
    request = term.includes('*')
      ? request.filter('search_text', 'imatch', term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : request.ilike('search_text', `%${term.replace(/[\\%_]/g, '\\$&')}%`);
  }
  if (category) request = request.eq('category', category);
  if (brand) request = request.eq('brand', brand);
  if (ready) request = request.eq('availability', 'ready');
  if (sort === 'price-asc' || sort === 'price-desc') request = request.order('price_idr', { ascending: sort === 'price-asc', nullsFirst: false });
  else if (sort === 'name') request = request.order('name_id');
  else request = request.order('is_featured', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  const { data, error, count, status } = await request.order('id').range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1).abortSignal(signalWithTimeout(signal));
  if (status === 416 && page > 1) {
    const first = await request.range(0, 0).abortSignal(signalWithTimeout(signal));
    if (first.error) throw first.error;
    return { products: [], total: first.count ?? 0 };
  }
  if (error) throw error;
  return { products: productSchema.array().parse(data), total: count ?? 0 };
}

function pageOptions(filters: CatalogFilters) {
  return { ...queryDefaults, queryKey: ['catalog', 'page', filters] as const, queryFn: ({ signal }: { signal: AbortSignal }) => getPage(filters, signal) };
}

export function useCatalogPage(filters: CatalogFilters) {
  const cache = useQueryClient();
  const query = useQuery({ ...pageOptions(filters), placeholderData: keepPreviousData });
  const { query: search, category, brand, ready, sort, page } = filters;
  useEffect(() => {
    if (query.data && !query.isPlaceholderData && page * PAGE_SIZE < query.data.total) {
      void cache.prefetchQuery(pageOptions({ query: search, category, brand, ready, sort, page: page + 1 }));
    }
  }, [cache, search, category, brand, ready, sort, page, query.data, query.isPlaceholderData]);
  return query;
}

export function useCatalogFacets() {
  return useQuery({ ...queryDefaults, staleTime: 5 * 60_000, queryKey: ['catalog', 'facets'], queryFn: async ({ signal }) => {
    if (catalogDemo) return { categories: [...new Set(demoProducts.map(p => p.category))], brands: [...new Set(demoProducts.map(p => p.brand).filter((b): b is string => Boolean(b)))].sort().map(name => ({ name, count: demoProducts.filter(p => p.brand === name).length })) };
    const { data, error } = await supabase.rpc('catalog_facets').abortSignal(signalWithTimeout(signal));
    if (error) throw error;
    return facetsSchema.parse(data);
  } });
}

export function useFeaturedProducts() {
  return useQuery({ ...queryDefaults, queryKey: ['catalog', 'featured'], queryFn: async ({ signal }) => {
    if (catalogDemo) return [...demoProducts].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 4);
    const { data, error } = await supabase.from('products').select(columns).eq('is_active', true)
      .order('is_featured', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).order('id').limit(4).abortSignal(signalWithTimeout(signal));
    if (error) throw error;
    return productSchema.array().parse(data);
  } });
}

export function useProduct(id: string | undefined) {
  return useQuery({ ...queryDefaults, queryKey: ['catalog', 'product', id], queryFn: async ({ signal }) => {
    if (catalogDemo) return demoProducts.find(p => p.id === id) ?? null;
    if (!id || !uuid.test(id)) return null;
    const { data, error } = await supabase.from('products').select(columns).eq('is_active', true).eq('id', id).abortSignal(signalWithTimeout(signal)).maybeSingle();
    if (error) throw error;
    return data ? productSchema.parse(data) : null;
  } });
}

export function useRelatedProducts(product: Product | null | undefined) {
  return useQuery({ ...queryDefaults, queryKey: ['catalog', 'related', product?.category, product?.id], enabled: Boolean(product), queryFn: async ({ signal }) => {
    if (!product) return [];
    if (catalogDemo) return demoProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    const { data, error } = await supabase.from('products').select(columns).eq('is_active', true).eq('category', product.category).neq('id', product.id).order('id').limit(4).abortSignal(signalWithTimeout(signal));
    if (error) throw error;
    return productSchema.array().parse(data);
  } });
}

export function useCartProducts(ids: string[]) {
  const keys = [...new Set(ids)].sort();
  return useQuery({ ...queryDefaults, staleTime: 0, queryKey: ['catalog', 'cart', keys], enabled: keys.length > 0, queryFn: async ({ signal }) => {
    if (catalogDemo) return demoProducts.filter(p => keys.includes(p.id));
    const valid = keys.filter(id => uuid.test(id));
    if (!valid.length) return [];
    const { data, error } = await supabase.from('products').select(columns).eq('is_active', true).in('id', valid).abortSignal(signalWithTimeout(signal));
    if (error) throw error;
    return productSchema.array().parse(data);
  } });
}
