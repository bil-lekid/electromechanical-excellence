import { z } from 'zod';

export const categories = ['Komponen Elektrikal', 'Mekanikal & Bearing', 'Otomasi & Kontrol', 'Kabel & Wiring', 'Motor & Pompa', 'Perkakas & Safety'];
export const productSchema = z.object({
  id: z.string(), name_id: z.string(), name_en: z.string().default(''),
  description_id: z.string().nullable(), description_en: z.string().nullable().optional(),
  category: z.string(), brand: z.string().nullable(), image_url: z.string().nullable(),
  is_featured: z.boolean().nullable(), created_at: z.string(), updated_at: z.string(),
  sku: z.string().nullable(), price_idr: z.number().nonnegative().nullable(),
  unit: z.string(), availability: z.enum(['ready', 'on_request', 'unavailable']),
  specifications: z.record(z.string()), is_active: z.boolean(),
});
export type Product = z.infer<typeof productSchema>;
export type CartLine = { productId: string; quantity: number };
export type Quote = { id: string; user_id: string; request_token: string; contact_name: string; company: string; phone: string; email: string; address: string; notes: string; status: 'submitted' | 'reviewing' | 'quoted' | 'closed'; created_at: string };
export type QuoteItem = { id: string; quote_id: string; product_id: string; product_name: string; sku: string | null; unit: string; quantity: number; reference_price_idr: number | null };
export const statusLabels: Record<Quote['status'], string> = { submitted: 'Diajukan', reviewing: 'Sedang ditinjau', quoted: 'Penawaran tersedia', closed: 'Selesai' };
export const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  company: z.string().trim().min(2, 'Isi nama perusahaan').max(200),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{8,25}$/, 'Nomor telepon tidak valid'),
  address: z.string().trim().min(10, 'Isi alamat lengkap minimal 10 karakter').max(1000),
  notes: z.string().trim().max(2000),
});
export function parseCart(value: string | null): CartLine[] {
  try { return z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(9999) })).max(100).parse(JSON.parse(value || '[]')).filter((line, index, all) => all.findIndex(x => x.productId === line.productId) === index) as CartLine[]; } catch { return []; }
}
export function filterProducts(products: Product[], query: string, category: string, brand: string, available: boolean, sort: string) {
  const terms = query.toLocaleLowerCase('id-ID').trim().split(/\s+/).filter(Boolean);
  return products.filter(p => terms.every(term => `${p.name_id} ${p.brand ?? ''} ${p.sku ?? ''} ${p.category}`.toLocaleLowerCase('id-ID').includes(term)) && (!category || p.category === category) && (!brand || p.brand === brand) && (!available || p.availability === 'ready')).sort((a,b) => {
    if (sort === 'price-asc' || sort === 'price-desc') {
      if (a.price_idr === null) return b.price_idr === null ? 0 : 1;
      if (b.price_idr === null) return -1;
      return sort === 'price-asc' ? a.price_idr - b.price_idr : b.price_idr - a.price_idr;
    }
    if (sort === 'name') return a.name_id.localeCompare(b.name_id);
    return Number(b.is_featured) - Number(a.is_featured) || b.created_at.localeCompare(a.created_at);
  });
}
export function safeImage(value: string | null) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}

// Development preview only: no invented price, inventory count or technical spec.
export const demoProducts: Product[] = [
  ['Miniature Circuit Breaker', 'Schneider Electric', 0], ['Magnetic Contactor', 'Schneider Electric', 0],
  ['Deep Groove Ball Bearing', 'SKF', 1], ['Programmable Logic Controller', 'Omron', 2],
  ['Kabel Kontrol Industri', 'Supreme', 3], ['Motor Listrik Industri', 'Teco', 4],
  ['Perkakas Bor Listrik', 'Bosch', 5], ['Safety Helmet', null, 5],
  ['Panel Meter Digital', 'Omron', 2], ['Pompa Air Industri', 'Grundfos', 4],
  ['Terminal Block', 'Legrand', 0], ['Roller Bearing', 'NSK', 1],
].map(([name, brand, category], i) => ({
  id: `demo-${i+1}`, name_id: String(name), name_en: String(name), brand: brand ? String(brand) : null,
  category: categories[Number(category)], description_id: 'Contoh tampilan katalog. Model, spesifikasi, harga, dan ketersediaan produk akan diisi berdasarkan katalog resmi perusahaan.',
  image_url: null, is_featured: i < 4, created_at: '2026-09-14', updated_at: '2026-09-14',
  sku: `CONTOH-${String(i+1).padStart(3,'0')}`, price_idr: null, unit: 'pcs', availability: 'on_request', specifications: {}, is_active: true,
}));
