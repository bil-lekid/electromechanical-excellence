import { FormEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { categories, Product, productSchema, statusLabels, Quote, safeImage } from '@/lib/store';
import { Breadcrumb } from '@/components/store/StoreUI';
import { useAuth } from '@/contexts/AuthContext';

const blank = { name_id: '', name_en: '', description_id: '', category: categories[0], brand: '', sku: '', price: '', unit: 'pcs', availability: 'on_request' as Product['availability'], image_url: '', specs: '{}', is_active: true, is_featured: false };
export default function AdminPage() {
  const { user } = useAuth(); const cache = useQueryClient(); const [tab,setTab] = useState<'products'|'quotes'>('quotes');
  const [editing,setEditing] = useState<string|null>(null); const [form,setForm] = useState(blank); const [busy,setBusy] = useState(false);
  const query = useQuery({ queryKey: ['admin',user?.id,tab], retry: false, queryFn: async () => {
    if (tab === 'products') {
      const products: Product[] = [];
      for (let offset=0;;offset+=500) {
        const { data,error } = await supabase.from('products').select('*').order('id').range(offset,offset+499).abortSignal(AbortSignal.timeout(15000)); if (error) throw error;
        products.push(...data); if (data.length<500) break;
      }
      return { products, quotes: [] as Quote[] };
    }
    const { data,error } = await supabase.from('quote_requests').select('*').order('created_at',{ ascending:false }).limit(100).abortSignal(AbortSignal.timeout(15000)); if (error) throw error;
    return { products: [] as Product[], quotes: data };
  } });
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return;
    let product: Omit<Product,'id'|'created_at'|'updated_at'>;
    try {
      if (form.image_url && !safeImage(form.image_url)) throw new Error('Gunakan URL gambar HTTPS.');
      product = productSchema.omit({ id:true, created_at:true, updated_at:true }).parse({ ...form, name_id: form.name_id.trim(), name_en: form.name_en.trim() || form.name_id.trim(), sku: form.sku.trim() || null, brand: form.brand.trim() || null, image_url: form.image_url || null, specifications: JSON.parse(form.specs), price_idr: form.price === '' ? null : Number(form.price) });
      if (!product.name_id || product.name_id.length > 200) throw new Error('Isi nama produk (maksimal 200 karakter).');
    } catch (e) { toast.error(e instanceof Error && !('issues' in e) ? e.message : 'Periksa harga dan spesifikasi. Spesifikasi harus berupa objek JSON dengan nilai teks.'); return; }
    setBusy(true);
    try {
      const { error } = editing === 'new' ? await supabase.from('products').insert(product).abortSignal(AbortSignal.timeout(15000)) : await supabase.from('products').update(product).eq('id',editing!).abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      toast.success('Produk tersimpan'); setEditing(null); void cache.invalidateQueries({ queryKey:['catalog'] }); void query.refetch();
    } catch { toast.error('Produk belum tersimpan. Periksa SKU unik, data, dan hak akses admin.'); }
    finally { setBusy(false); }
  };
  const edit = (p: Product) => { setForm({ name_id:p.name_id, name_en:p.name_en, description_id:p.description_id || '', category:p.category, brand:p.brand || '', sku:p.sku || '', price:p.price_idr === null ? '' : String(p.price_idr), unit:p.unit, availability:p.availability, image_url:p.image_url || '', specs:JSON.stringify(p.specifications,null,2), is_active:p.is_active, is_featured:!!p.is_featured }); setEditing(p.id); };
  const status = async (id: string,value: Quote['status']) => {
    if (busy) return; setBusy(true);
    try { const { error } = await supabase.from('quote_requests').update({ status:value }).eq('id',id).abortSignal(AbortSignal.timeout(15000)); if (error) throw error; void query.refetch(); void cache.invalidateQueries({ queryKey:['quotes'] }); toast.success('Status diperbarui'); }
    catch { toast.error('Status belum tersimpan.'); } finally { setBusy(false); }
  };
  return <div className="store-container page-space"><Breadcrumb current="Pengelolaan toko" /><div className="page-heading"><span className="eyebrow">ADMIN</span><h1>Pengelolaan toko</h1><p>Kelola katalog dan tindak lanjuti permintaan pelanggan.</p></div><div className="admin-tabs"><button className={tab==='quotes'?'active':''} onClick={() => setTab('quotes')}>Permintaan penawaran</button><button className={tab==='products'?'active':''} onClick={() => setTab('products')}>Katalog produk</button></div>{query.isLoading && <p role="status">Memuat...</p>}{query.isError && <div role="alert" className="inline-notice">Data admin belum dapat dimuat. <button onClick={() => void query.refetch()}>Coba lagi</button></div>}{tab==='products' && <><button className="store-button" onClick={() => { setForm(blank); setEditing('new'); }}><Plus size={17} /> Tambah produk</button>{editing && <form className="admin-editor quote-form" onSubmit={save}><div className="section-heading"><h2>{editing==='new'?'Produk baru':'Edit produk'}</h2><button type="button" aria-label="Tutup editor" disabled={busy} onClick={() => setEditing(null)}><X /></button></div><fieldset disabled={busy}><div className="form-grid"><label>Nama produk<input required maxLength={200} value={form.name_id} onChange={e => setForm({ ...form,name_id:e.target.value })} /></label><label>Nama Inggris (opsional)<input maxLength={200} value={form.name_en} onChange={e => setForm({ ...form,name_en:e.target.value })} /></label><label>SKU<input maxLength={100} value={form.sku} onChange={e => setForm({ ...form,sku:e.target.value })} /></label><label>Merek<input maxLength={100} value={form.brand} onChange={e => setForm({ ...form,brand:e.target.value })} /></label><label>Kategori<select value={form.category} onChange={e => setForm({ ...form,category:e.target.value })}>{[...new Set([...categories,form.category])].map(c => <option key={c}>{c}</option>)}</select></label><label>Harga referensi IDR (kosong = minta harga)<input type="number" min="0" max="999999999999" step="0.01" value={form.price} onChange={e => setForm({ ...form,price:e.target.value })} /></label><label>Satuan<input required maxLength={30} value={form.unit} onChange={e => setForm({ ...form,unit:e.target.value })} /></label><label>Ketersediaan<select value={form.availability} onChange={e => setForm({ ...form,availability:e.target.value as Product['availability'] })}><option value="on_request">Konfirmasi dahulu</option><option value="ready">Tersedia</option><option value="unavailable">Tidak tersedia</option></select></label></div><label>URL gambar HTTPS<input type="url" value={form.image_url} onChange={e => setForm({ ...form,image_url:e.target.value })} /></label><label>Deskripsi<textarea value={form.description_id} onChange={e => setForm({ ...form,description_id:e.target.value })} /></label><label>Spesifikasi JSON<textarea rows={4} value={form.specs} onChange={e => setForm({ ...form,specs:e.target.value })} /><small>Contoh: {'{"Tegangan": "220 V", "Satuan": "pcs"}'}</small></label><label className="checkbox-label"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form,is_active:e.target.checked })} /> Tampilkan di katalog</label><label className="checkbox-label"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form,is_featured:e.target.checked })} /> Produk pilihan beranda</label><button className="store-button">{busy?'Menyimpan...':'Simpan produk'}</button></fieldset></form>}<div className="table-scroll"><table className="admin-table"><thead><tr><th>Produk</th><th>SKU</th><th>Katalog</th><th>Aksi</th></tr></thead><tbody>{query.data?.products.map(p => <tr key={p.id}><td>{p.name_id}<small>{p.brand}</small></td><td>{p.sku || '—'}</td><td>{p.is_active?'Aktif':'Disembunyikan'}</td><td><button className="text-button" onClick={() => edit(p)}>Edit</button></td></tr>)}</tbody></table></div></>}{tab==='quotes' && <><p className="muted">100 permintaan terbaru. Perubahan status tidak otomatis mengirim email atau WhatsApp.</p>{query.data?.quotes.length===0 && <div className="empty-state">Belum ada permintaan masuk.</div>}{query.data?.quotes.map(q => <AdminQuote key={q.id} quote={q} busy={busy} onStatus={value => void status(q.id,value)} />)}</>}</div>;
}
function AdminQuote({quote,busy,onStatus}:{quote:Quote;busy:boolean;onStatus:(value:Quote['status'])=>void}) {
  const [open,setOpen] = useState(false);
  const items = useQuery({ queryKey:['admin','quote-items',quote.id],enabled:open,retry:false,queryFn:async()=>{const {data,error}=await supabase.from('quote_items').select('*').eq('quote_id',quote.id).abortSignal(AbortSignal.timeout(15000));if(error)throw error;return data;}});
  return <details className="quote-record" onToggle={event => setOpen(event.currentTarget.open)}><summary><span><strong>{quote.company} · {quote.contact_name}</strong><small>RFQ-{quote.id.slice(0,8).toUpperCase()} · {new Date(quote.created_at).toLocaleDateString('id-ID')}</small></span><span className="status-tag">{statusLabels[quote.status]}</span></summary><div className="quote-record-body"><p>{quote.email} · {quote.phone}</p><p>{quote.address}</p><p>{quote.notes || 'Tanpa catatan'}</p>{items.isLoading && <p>Memuat produk...</p>}{items.isError && <p role="alert">Produk belum dapat dimuat. <button onClick={() => void items.refetch()}>Coba lagi</button></p>}<ul>{items.data?.map(item => <li key={item.id}>{item.product_name} ({item.sku || 'tanpa SKU'}) <strong>{item.quantity} {item.unit}</strong></li>)}</ul><label>Status permintaan<select value={quote.status} disabled={busy} onChange={e => onStatus(e.target.value as Quote['status'])}>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label></div></details>;
}
