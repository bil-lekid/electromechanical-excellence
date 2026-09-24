import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartLine, Product, parseCart } from '@/lib/store';
import { catalogDemo } from '@/hooks/useCatalog';
import { toast } from 'sonner';

const cartKey = 'ppp-cart-v1';
const StoreContext = createContext<{
  demo: boolean;
  cart: CartLine[]; add: (product: Product, qty?: number) => void; change: (id: string, qty: number) => void; clear: () => void;
}>(null!);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => { try { return parseCart(localStorage.getItem(cartKey)); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch { /* Storage may be disabled. */ } }, [cart]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === cartKey) setCart(parseCart(event.newValue)); };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  const add = (product: Product, qty = 1) => {
    if (!product || product.availability === 'unavailable' || !Number.isInteger(qty) || qty < 1 || qty > 9999) return;
    const id = product.id;
    if (!cart.some(line => line.productId === id) && cart.length >= 100) { toast.error('Maksimal 100 jenis produk per permintaan.'); return; }
    setCart(lines => { const found = lines.find(l => l.productId === id); return found ? lines.map(l => l.productId === id ? { ...l, quantity: Math.min(9999, l.quantity + qty) } : l) : [...lines, { productId: id, quantity: qty }]; });
    toast.success('Produk ditambahkan ke keranjang');
  };
  const change = (id: string, qty: number) => { if (!Number.isInteger(qty) || qty < 0 || qty > 9999) return; setCart(lines => qty === 0 ? lines.filter(l => l.productId !== id) : lines.map(l => l.productId === id ? { ...l, quantity: qty } : l)); };
  return <StoreContext.Provider value={{ demo: catalogDemo, cart, add, change, clear: () => setCart([]) }}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
