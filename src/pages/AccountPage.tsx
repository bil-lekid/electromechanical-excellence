import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Breadcrumb } from '@/components/store/StoreUI';
import { statusLabels, money, QuoteItem } from '@/lib/store';

export default function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const query = useQuery({ queryKey: ['quotes',user?.id], enabled: !!user, retry: false, queryFn: async () => {
    const { data, error } = await supabase.from('quote_requests').select('*').eq('user_id',user!.id).order('created_at',{ ascending:false }).limit(100).abortSignal(AbortSignal.timeout(15000)); if (error) throw error;
    const items: QuoteItem[] = [];
    if (data.length) for (let offset=0;;offset+=500) {
      const { data: batch, error: itemError } = await supabase.from('quote_items').select('*').in('quote_id',data.map(q => q.id)).order('id').range(offset,offset+499).abortSignal(AbortSignal.timeout(15000));
      if (itemError) throw itemError; items.push(...batch); if (batch.length<500) break;
    }
    return { quotes: data, items };
  } });
  return <div className="store-container page-space"><Breadcrumb current="Akun saya" /><div className="account-heading"><div className="page-heading"><span className="eyebrow">AKUN SAYA</span><h1>Permintaan penawaran</h1><p>{user?.email}</p></div><div className="button-row">{isAdmin && <Link to="/admin" className="store-button secondary"><Settings size={16} /> Kelola toko</Link>}<button className="store-button secondary" onClick={() => void signOut().catch(() => toast.error('Belum berhasil keluar. Coba lagi.'))}><LogOut size={16} /> Keluar</button></div></div><p className="muted">Menampilkan hingga 100 permintaan terakhir.</p>{query.isLoading && <div className="empty-state" role="status">Memuat permintaan...</div>}{query.isError && <div className="empty-state" role="alert"><h2>Permintaan belum dapat dimuat</h2><button className="store-button secondary" onClick={() => void query.refetch()}>Coba lagi</button></div>}{query.data?.quotes.length === 0 && <div className="empty-state"><FileText /><h2>Belum ada permintaan.</h2><p>Pilih produk di katalog untuk memulai.</p><Link to="/products" className="store-button">Jelajahi katalog</Link></div>}<div className="quote-list">{query.data?.quotes.map(quote => <details key={quote.id} className="quote-record"><summary><span><strong>RFQ-{quote.id.slice(0,8).toUpperCase()}</strong><small>{new Date(quote.created_at).toLocaleDateString('id-ID')} · {quote.company}</small></span><span className={`status-tag ${quote.status}`}>{statusLabels[quote.status]}</span></summary><div className="quote-record-body"><p><strong>Tujuan:</strong> {quote.address}</p><p><strong>Catatan:</strong> {quote.notes || '—'}</p><ul>{query.data.items.filter(i => i.quote_id === quote.id).map(item => <li key={item.id}><span>{item.product_name} · {item.quantity} {item.unit}</span><span>{item.reference_price_idr === null ? 'Minta harga' : `${money(item.reference_price_idr)} / ${item.unit}`}</span></li>)}</ul><small>Harga tercatat adalah referensi saat pengajuan. Penawaran final disampaikan sales melalui kontak Anda.</small><Link to="/contact" className="text-button">Hubungi sales terkait permintaan ini →</Link></div></details>)}</div></div>;
}
