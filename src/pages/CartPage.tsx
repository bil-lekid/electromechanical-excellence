import { FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { useCartProducts } from '@/hooks/useCatalog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { contactSchema, money } from '@/lib/store';
import { Breadcrumb, CatalogState, ProductImage, Quantity } from '@/components/store/StoreUI';

export default function CartPage() {
  const { cart, change, clear, demo } = useStore();
  const catalog = useCartProducts(cart.map(line => line.productId));
  const products = catalog.data ?? [], loading = catalog.isFetching, error = catalog.isError;
  const { user } = useAuth(); const cache = useQueryClient(); const [busy, setBusy] = useState(false); const submitting = useRef(false);
  const [success, setSuccess] = useState(''); const attempt = useRef({ fingerprint: '', token: crypto.randomUUID() });
  const [contact, setContact] = useState({ name: '', company: '', phone: '', address: '', notes: '' });
  const lines = cart.map(line => ({ ...line, product: products.find(p => p.id === line.productId) }));
  const invalid = lines.some(line => !line.product || line.product.availability === 'unavailable' || line.product.id.startsWith('demo-'));
  const unknown = lines.some(line => line.product?.price_idr == null);
  const total = lines.reduce((sum,line) => sum + (line.product?.price_idr ?? 0) * line.quantity, 0);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || !user || demo || invalid || !cart.length || error || loading) return;
    const result = contactSchema.safeParse(contact);
    if (!result.success) { toast.error(result.error.issues[0].message); return; }
    submitting.current = true; setBusy(true);
    const fingerprint = JSON.stringify({ user: user.id, contact: result.data, cart });
    if (attempt.current.fingerprint !== fingerprint) attempt.current = { fingerprint, token: crypto.randomUUID() };
    try {
      const { data, error: failure } = await supabase.rpc('submit_quote', { _token: attempt.current.token, _contact: result.data, _items: cart.map(line => ({ product_id: line.productId, quantity: line.quantity })) }).abortSignal(AbortSignal.timeout(20000));
      if (failure || !data) throw failure;
      setSuccess(data); clear(); setContact({ name: '', company: '', phone: '', address: '', notes: '' });
      attempt.current = { fingerprint: '', token: crypto.randomUUID() }; void cache.invalidateQueries({ queryKey: ['quotes'] });
    } catch { toast.error('Permintaan belum dapat dikonfirmasi. Periksa koneksi, tunggu satu menit, lalu coba lagi. Keranjang Anda tetap tersimpan.'); }
    finally { setBusy(false); submitting.current = false; }
  };
  if (success) return <div className="store-container page-space"><div className="empty-state success-state"><CheckCircle2 /><span className="eyebrow">PERMINTAAN TERSIMPAN</span><h1>Terima kasih. Mari kami bantu.</h1><p>Tim sales dapat meninjau permintaan Anda. Lihat perkembangannya melalui akun Anda.</p><code>Referensi: {success}</code><div className="button-row"><Link to="/account" className="store-button">Lihat permintaan saya</Link><Link to="/products" className="store-button secondary">Lanjut jelajahi</Link></div></div></div>;
  return <div className="store-container page-space"><Breadcrumb current="Keranjang & penawaran" /><div className="page-heading"><span className="eyebrow">PENGADAAN LEBIH MUDAH</span><h1>Keranjang Anda</h1><p>Periksa produk, lengkapi data, lalu ajukan penawaran kepada tim sales.</p></div>{!cart.length ? <div className="empty-state"><ShoppingCart /><h2>Mulai dengan produk yang Anda butuhkan.</h2><p>Produk pilihan Anda akan muncul di sini.</p><Link to="/products" className="store-button">Jelajahi katalog <ArrowRight size={17} /></Link></div> : <><CatalogState loading={loading} error={error} reload={() => void catalog.refetch()} /><div className="cart-layout"><div><div className="cart-lines">{lines.map(line => <article className="cart-line" key={line.productId}>{line.product && <ProductImage product={line.product} />}<div><Link to={`/products/${line.productId}`} className="product-name">{line.product?.name_id || (loading || error ? 'Menunggu data produk' : 'Produk tidak lagi tersedia')}</Link><p className="product-sku">{line.product?.sku}</p><strong>{line.product?.price_idr != null ? money(line.product.price_idr) : 'Harga perlu dikonfirmasi'}</strong><div className="line-quantity"><Quantity value={line.quantity} onChange={q => { if (!busy) change(line.productId,q); }} /><span>{line.product?.unit}</span></div></div><button className="remove-item" aria-label={`Hapus ${line.product?.name_id || 'produk'}`} disabled={busy} onClick={() => change(line.productId,0)}><Trash2 size={18} /></button></article>)}</div><Link className="text-button" to="/products">← Tambah produk lainnya</Link><form id="quote-form" className="quote-form" onSubmit={submit}><h2>Informasi permintaan</h2><p>Data ini digunakan untuk menyiapkan dan menindaklanjuti penawaran Anda.</p><fieldset disabled={busy}><div className="form-grid"><label>Nama lengkap<input required autoComplete="name" maxLength={100} value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} /></label><label>Perusahaan<input required autoComplete="organization" maxLength={200} value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} /></label><label>Nomor telepon / WhatsApp<input required type="tel" autoComplete="tel" maxLength={25} value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label><label>Email akun<input type="email" value={user?.email || ''} readOnly placeholder="Masuk untuk menggunakan email akun" /></label></div><label>Alamat tujuan<input required autoComplete="street-address" minLength={10} maxLength={1000} value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} /></label><label>Catatan kebutuhan <span className="muted">(opsional)</span><textarea rows={3} maxLength={2000} placeholder="Model khusus, target waktu pengiriman, atau kebutuhan proyek..." value={contact.notes} onChange={e => setContact({ ...contact, notes: e.target.value })} /></label></fieldset></form></div><aside className="order-summary"><h2>Ringkasan permintaan</h2><div><span>Jenis produk</span><strong>{cart.length}</strong></div><div><span>Total jumlah</span><strong>{cart.reduce((n,l) => n+l.quantity,0)}</strong></div><hr /><div className="summary-total"><span>{unknown ? 'Subtotal berharga' : 'Subtotal referensi'}</span><strong>{money(total)}</strong></div>{unknown && <p>Sebagian atau seluruh produk memerlukan konfirmasi harga.</p>}<p>Pajak, ongkos kirim, harga final, dan ketersediaan dikonfirmasi oleh sales. Pengajuan ini belum merupakan pembayaran atau pesanan yang disetujui.</p>{demo ? <p className="inline-notice">Mode contoh: permintaan tidak dikirim. Isi keranjang dapat dicoba.</p> : invalid && !loading && !error ? <p className="inline-notice">Hapus produk yang tidak tersedia atau produk contoh sebelum melanjutkan.</p> : null}{user ? <button form="quote-form" className="store-button" disabled={busy || demo || invalid || loading || error}>{busy ? 'Menyimpan permintaan...' : 'Ajukan penawaran'}<ArrowRight size={17} /></button> : <Link to="/auth?next=cart" className="store-button">Masuk untuk mengajukan <ArrowRight size={17} /></Link>}<small><LockKeyhole size={13} /> Permintaan hanya dapat diakses akun Anda dan admin.</small></aside></div></>}</div>;
}
