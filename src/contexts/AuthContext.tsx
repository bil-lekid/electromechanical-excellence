import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null; session: Session | null; isAdmin: boolean; loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>(null!);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const cache = useQueryClient();
  useEffect(() => {
    let active = true;
    let version = 0;
    const update = async (next: Session | null) => {
      if (!active) return;
      const current = ++version;
      setSession(next); setIsAdmin(false); setLoading(true);
      try {
        if (next) {
          const { data, error } = await supabase.rpc('is_admin').abortSignal(AbortSignal.timeout(10000));
          if (active && current === version) setIsAdmin(!error && data === true);
        }
      } catch { /* Missing role service fails closed. */ }
      finally { if (active && current === version) setLoading(false); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      // Run role queries outside the auth lock and discard stale results.
      const eventVersion = ++version;
      setIsAdmin(false); setLoading(true); setSession(next);
      cache.removeQueries({ predicate: q => q.queryKey[0] === 'quotes' || q.queryKey[0] === 'admin' });
      setTimeout(() => { if (active && version === eventVersion) void update(next); }, 0);
    });
    const initialVersion = version;
    void supabase.auth.getSession().then(({ data }) => { if (active && version === initialVersion) void update(data.session); }).catch(() => { if (active && version === initialVersion) void update(null); });
    return () => { active = false; version++; subscription.unsubscribe(); };
  }, [cache]);
  const signIn = async (email: string, password: string) => {
    try { const { error } = await supabase.auth.signInWithPassword({ email, password }); return { error }; }
    catch { return { error: new Error('Layanan akun belum dapat dihubungi. Silakan coba lagi.') }; }
  };
  const signUp = async (email: string, password: string) => {
    try { const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } }); return { error }; }
    catch { return { error: new Error('Layanan akun belum dapat dihubungi. Silakan coba lagi.') }; }
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null); setIsAdmin(false);
    cache.removeQueries({ predicate: q => q.queryKey[0] === 'quotes' || q.queryKey[0] === 'admin' });
  };
  return <AuthContext.Provider value={{ user: session?.user ?? null, session, isAdmin, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
