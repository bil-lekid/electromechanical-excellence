import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useCatalogPage, useCatalogFacets, PAGE_SIZE } from '@/hooks/useCatalog';
import { categories } from '@/lib/store';
import { Breadcrumb, CatalogState, ProductCard } from '@/components/store/StoreUI';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') || '').slice(0, 150);
  const category = params.get('category') || '', brand = params.get('brand') || '';
  const sort = params.get('sort') || 'featured', ready = params.get('ready') === 'true';
  const requested = Number(params.get('page'));
  const page = Number.isFinite(requested) ? Math.min(1_000_000, Math.max(1, Math.floor(requested))) : 1;
  const catalog = useCatalogPage({ query, category, brand, sort, ready, page });
  const facets = useCatalogFacets();
  const products = catalog.data?.products ?? [], total = catalog.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loading = catalog.isLoading, error = catalog.isError, updating = catalog.isFetching || catalog.isPlaceholderData;
  useEffect(() => {
    if (catalog.data && !catalog.isPlaceholderData && page > pages) {
      setParams(previous => { const next = new URLSearchParams(previous); next.set('page', String(pages)); return next; }, { replace: true });
    }
  }, [catalog.data, catalog.isPlaceholderData, page, pages, setParams]);
  const pageLink = (value: number) => { const next = new URLSearchParams(params); next.set('page', String(value)); return `/products?${next}`; };
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };
  const allCategories = [...new Set([...categories, ...(facets.data?.categories ?? []), ...(category ? [category] : [])])];
  const brands = [...new Set([...(facets.data?.brands.map(b => b.name) ?? []), ...(brand ? [brand] : [])])];
  return <div className="store-container page-space">
    <Breadcrumb current="Katalog produk" />
    <div className="page-heading"><span className="eyebrow">INDUSTRIAL SUPPLY</span><h1>{query ? `Hasil pencarian “${query}”` : category || 'Katalog produk'}</h1><p>Temukan produk berdasarkan kebutuhan, merek, dan spesifikasi Anda.</p></div>
    <div className="catalog-layout">
      <aside className="catalog-filters"><h2><SlidersHorizontal size={17} /> Filter produk</h2>
        <label>Kategori<select aria-label="Kategori" value={category} onChange={e => update('category', e.target.value)}><option value="">Semua kategori</option>{allCategories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Merek<select aria-label="Merek" value={brand} onChange={e => update('brand', e.target.value)}><option value="">Semua merek</option>{brands.map(b => <option key={b}>{b}</option>)}</select></label>
        {facets.isError && <p role="status">Daftar filter belum dimuat. <button className="text-button" onClick={() => void facets.refetch()}>Muat ulang filter</button></p>}
        <label className="checkbox-label"><input type="checkbox" checked={ready} onChange={e => update('ready', e.target.checked ? 'true' : '')} /> Hanya produk tersedia</label>
        <button className="text-button" onClick={() => setParams({})}>Reset semua filter</button>
        <div className="filter-help"><h3>Belum menemukan produk?</h3><p>Kami bantu mencarikan komponen yang Anda butuhkan.</p><Link to="/contact">Tanya tim sales →</Link></div>
      </aside>
      <div className="catalog-results" aria-busy={loading || updating}>
        <div className="catalog-toolbar"><span role="status" aria-live="polite">{loading ? 'Memuat...' : updating ? 'Memperbarui hasil...' : `${total} produk`}</span><label>Urutkan <select aria-label="Urutkan" value={sort} onChange={e => update('sort', e.target.value)}><option value="featured">Rekomendasi</option><option value="name">Nama A–Z</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option></select></label></div>
        <CatalogState loading={loading} error={error} reload={() => void catalog.refetch()} />
        {!loading && !error && (products.length ? <>
          <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
          {pages > 1 && <nav className="pagination" aria-label="Halaman katalog"><Link to={pageLink(Math.max(1, page - 1))} aria-disabled={page <= 1 || updating} onClick={e => { if (page <= 1 || updating) e.preventDefault(); }}>Sebelumnya</Link><span>{Math.min(page, pages)} / {pages}</span><Link to={pageLink(Math.min(pages, page + 1))} aria-disabled={page >= pages || updating} onClick={e => { if (page >= pages || updating) e.preventDefault(); }}>Berikutnya</Link></nav>}
        </> : !updating && <div className="empty-state"><Search /><h2>Produk belum ditemukan</h2><p>Coba kata kunci lain atau ubah filter pencarian.</p><button className="store-button secondary" onClick={() => setParams({})}>Lihat semua produk</button></div>)}
      </div>
    </div>
  </div>;
}
