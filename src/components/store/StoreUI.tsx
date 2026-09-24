import { Cable, CircuitBoard, Cog, Fan, Wrench, Zap, Package, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { categories, money, Product, safeImage } from '@/lib/store';
import { useStore } from '@/contexts/StoreContext';

export const categoryIcons = [Zap, Cog, CircuitBoard, Cable, Fan, Wrench];
export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = safeImage(product.image_url);
  const Icon = categoryIcons[categories.indexOf(product.category)] || Package;
  return <div className={`product-image ${large ? 'large' : ''}`}>
    {url && !failed ? <img src={url} alt={product.name_id} loading={large ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} /> : <><Icon strokeWidth={1} aria-hidden="true" /><span>{product.image_url ? 'Gambar tidak tersedia' : 'Ilustrasi kategori'}</span></>}
  </div>;
}
export function Availability({ value }: { value: Product['availability'] }) {
  return <span className={`availability ${value}`}><i />{value === 'ready' ? 'Tersedia' : value === 'unavailable' ? 'Belum tersedia' : 'Konfirmasi ketersediaan'}</span>;
}
export function ProductCard({ product }: { product: Product }) {
  const { add } = useStore();
  return <article className="product-card">
    <Link to={`/products/${product.id}`} aria-label={`Lihat ${product.name_id}`}><ProductImage product={product} /></Link>
    <div className="product-card-body"><p className="product-brand">{product.brand || 'Industrial supply'}</p><Link to={`/products/${product.id}`} className="product-name">{product.name_id}</Link><p className="product-sku">{product.sku || 'SKU belum tersedia'}</p><Availability value={product.availability} /><div className="product-price">{product.price_idr !== null ? money(product.price_idr) : 'Minta harga'}<small> / {product.unit}</small></div>
      <button className="store-button secondary card-add" onClick={() => add(product)} disabled={product.availability === 'unavailable'} aria-label={`Tambah ${product.name_id} ke keranjang`}><Plus size={16} /> Keranjang</button>
    </div>
  </article>;
}
export function CatalogState({ loading, error, reload }: { loading: boolean; error: boolean; reload: () => void }) {
  if (loading) return <div className="empty-state" role="status"><Loader2 className="spin" /><h2>Memuat katalog...</h2></div>;
  if (error) return <div className="empty-state" role="alert"><Package /><h2>Katalog belum dapat dimuat</h2><p>Coba lagi atau hubungi tim sales untuk kebutuhan produk Anda.</p><div className="button-row"><button className="store-button secondary" onClick={reload}>Coba lagi</button><Link to="/contact" className="store-button">Hubungi sales <ArrowRight size={16} /></Link></div></div>;
  return null;
}
export function Breadcrumb({ current }: { current: string }) { return <nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>{current}</span></nav>; }
export function Quantity({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="quantity"><button type="button" aria-label="Kurangi jumlah" disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button><input aria-label="Jumlah produk" type="number" min="1" max="9999" value={value} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= 9999) onChange(n); }} /><button type="button" aria-label="Tambah jumlah" disabled={value >= 9999} onClick={() => onChange(value + 1)}>+</button></div>;
}
