import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartLine, Product, demoProducts, parseCart, productSchema } from '@/lib/store';
import { toast } from 'sonner';

const preview = import.meta.env.DEV && import.meta.env.VITE_CATALOG_DEMO === 'true';
const cartKey = 'ppp-cart-v1';
const StoreContext = createContext<{
  products: Product[]; loading: boolean; error: boolean; demo: boolean; reload: () => void;
  cart: CartLine[]; add: (id: string, qty?: number) => void; change: (id: string, qty: number) => void; clear: () => void;
}>(null!);

export function StoreProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ['catalog'], queryFn: async () => {
    if (preview) return demoProducts;
    const products: Product[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('id').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      products.push(...productSchema.array().parse(data));
      if (data.length < 500) return products;
    }
  }, retry: false, staleTime: 60000 });
  const [cart, setCart] = useState<CartLine[]>(() => { try { return parseCart(localStorage.getItem(cartKey)); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch { /* Storage may be disabled. */ } }, [cart]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === cartKey) setCart(parseCart(event.newValue)); };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  const add = (id: string, qty = 1) => {
    const product = query.data?.find(p => p.id === id);
    if (!product || product.availability === 'unavailable' || !Number.isInteger(qty) || qty < 1 || qty > 9999) return;
    if (!cart.some(line => line.productId === id) && cart.length >= 100) { toast.error('Maksimal 100 jenis produk per permintaan.'); return; }
    setCart(lines => { const found = lines.find(l => l.productId === id); return found ? lines.map(l => l.productId === id ? { ...l, quantity: Math.min(9999, l.quantity + qty) } : l) : [...lines, { productId: id, quantity: qty }]; });
    toast.success('Produk ditambahkan ke keranjang');
  };
  const change = (id: string, qty: number) => { if (!Number.isInteger(qty) || qty < 0 || qty > 9999) return; setCart(lines => qty === 0 ? lines.filter(l => l.productId !== id) : lines.map(l => l.productId === id ? { ...l, quantity: qty } : l)); };
  return <StoreContext.Provider value={{ products: query.data ?? [], loading: query.isLoading, error: query.isError, demo: preview, reload: () => void query.refetch(), cart, add, change, clear: () => setCart([]) }}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
