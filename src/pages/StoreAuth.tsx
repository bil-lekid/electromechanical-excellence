import { FormEvent, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

export default function StoreAuth() {
  const { user, loading, signIn, signUp } = useAuth(); const [params] = useSearchParams();
  const [mode,setMode] = useState<'login'|'signup'>('login'); const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [message,setMessage] = useState('');
  const destination = params.get('next') === 'cart' ? '/cart' : '/account';
  if (user && !loading) return <Navigate to={destination} replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return; setError(''); setMessage('');
    if (!z.string().email().max(255).safeParse(email.trim()).success) { setError('Periksa kembali alamat email Anda.'); return; }
    if (mode === 'signup' && password.length < 12) { setError('Gunakan minimal 12 karakter untuk kata sandi baru.'); return; }
    setBusy(true);
    try { const result = await (mode === 'login' ? signIn : signUp)(email.trim(),password); if (result.error) setError(mode === 'login' ? 'Belum berhasil masuk. Periksa email, kata sandi, atau coba lagi nanti.' : 'Pendaftaran belum berhasil. Periksa data atau coba lagi nanti.'); else if (mode === 'signup') setMessage('Jika pendaftaran berhasil diproses, periksa email untuk konfirmasi sebelum masuk.'); }
    catch { setError('Layanan akun belum dapat dihubungi. Coba lagi nanti.'); }
    finally { setBusy(false); }
  };
  return <div className="store-container auth-layout"><div className="auth-intro"><span className="eyebrow">AKUN BISNIS ANDA</span><h1>Pengadaan lebih rapi.<br />Bisnis terus berjalan.</h1><p>Simpan permintaan penawaran dan pantau statusnya dalam satu tempat.</p><div><ShieldCheck size={20} /> Data permintaan hanya untuk Anda dan tim kami.</div></div><form className="auth-form" onSubmit={submit}><h2>{mode === 'login' ? 'Selamat datang kembali.' : 'Buat akun Anda.'}</h2><p>{mode === 'login' ? 'Masuk untuk melanjutkan kebutuhan pengadaan.' : 'Gunakan email bisnis untuk mengelola permintaan.'}</p><label>Email<input type="email" required autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} /></label><label>Kata sandi<input type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'signup' ? 12 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></label>{mode === 'signup' && <small>Minimal 12 karakter. Gunakan kata sandi yang unik.</small>}{error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="inline-notice">{message}</p>}<button className="store-button" disabled={busy || loading}>{busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar akun'} <ArrowRight size={17} /></button><button type="button" className="text-button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); setPassword(''); }}>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button><Link to="/contact" className="muted">Perlu bantuan akses akun?</Link></form></div>;
}
