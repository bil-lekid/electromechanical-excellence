import { companyLinks, formPages, guidePages } from './site-pages';

// Preserve the existing canonical host. Production TLS/redirect repair needs owner approval.
export const siteOrigin = 'https://primaputraperkasa.com';
export const siteName = 'Prima Putra Perkasa';
type Page = { title: string; description: string; index: boolean };
const page = (title: string, description: string, index = true): Page => ({ title, description, index });
export const seoPages: Record<string, Page> = {
  '/': page('Supplier Elektrikal & Mekanikal', 'Prima Putra Perkasa membantu pengadaan komponen elektrikal dan mekanikal. Cari kebutuhan di katalog dan kirim spesifikasi untuk permintaan penawaran.'),
  '/products': page('Katalog Produk Elektrikal & Mekanikal', 'Cari produk berdasarkan nama, merek, atau kode barang. Susun kebutuhan dan jumlah untuk meminta konfirmasi spesifikasi, harga, dan waktu pengadaan.'),
  '/about': page('Tentang PPP', 'Kenali Prima Putra Perkasa dan proses pengadaan kebutuhan elektrikal dan mekanikal. Hubungi tim PPP untuk mendiskusikan spesifikasi kebutuhan Anda.'),
  '/contact': page('Kontak & Permintaan Penawaran', 'Hubungi tim Prima Putra Perkasa melalui telepon, email, atau WhatsApp. Siapkan merek, tipe, spesifikasi, jumlah, dan tujuan pengiriman untuk penawaran.'),
  '/brands': page('Merek dalam Katalog', 'Telusuri merek dalam katalog PPP dan cari komponen sesuai kebutuhan. Konfirmasikan tipe, spesifikasi, dan ketersediaan kepada tim sales.'),
  '/help': page('Pusat Bantuan Pengadaan', 'Panduan meminta penawaran, pembayaran, pengiriman, pengambilan, retur, dan garansi untuk membantu proses pengadaan bersama PPP.'),
  ...Object.fromEntries(companyLinks.filter(([path]) => !['/about', '/contact'].includes(path)).map(([path, title]) => [path, page(title, `${title} Prima Putra Perkasa. Hubungi tim PPP untuk informasi dan pertanyaan terkait kebutuhan pengadaan Anda.`, false)])),
  ...Object.fromEntries(formPages.map(p => [`/forms/${p.slug}`, page(p.title, p.intro)])),
  ...Object.fromEntries(guidePages.map(p => [`/help/${p.slug}`, page(p.title, p.intro)])),
  ...Object.fromEntries([['cart', 'Keranjang Permintaan'], ['auth', 'Masuk / Daftar'], ['account', 'Akun Saya'], ['admin', 'Administrasi'], ['tracking', 'Tracking Order']].map(([path, title]) => [`/${path}`, page(title, `${title} | ${siteName}`, false)])),
};

export function metadata(location: string) {
  const url = new URL(location, siteOrigin);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const known = seoPages[path];
  const product = /^\/products\/[^/]+$/.test(path);
  const selected = known || page(product ? 'Detail Produk — Konfirmasi Spesifikasi' : 'Halaman Tidak Ditemukan', product ? 'Periksa informasi produk dan konfirmasikan spesifikasi, jumlah, serta kebutuhan pengadaan kepada tim PPP sebelum meminta penawaran.' : 'Halaman yang Anda cari tidak tersedia. Buka katalog atau hubungi tim PPP untuk bantuan.', false);
  const filtered = path === '/products' && ['q', 'category', 'brand', 'sort', 'page', 'ready'].some(key => url.searchParams.has(key));
  const canonical = new URL(path, siteOrigin);
  if (filtered) {
    for (const key of ['q', 'category', 'brand', 'sort', 'page']) {
      const value = url.searchParams.get(key);
      if (value) canonical.searchParams.set(key, value);
    }
  }
  const index = selected.index && !filtered;
  const title = `${selected.title} | ${siteName}`;
  const schema: Record<string, unknown>[] = [];
  if (path === '/') schema.push({ '@context': 'https://schema.org', '@type': 'Organization', name: siteName, url: siteOrigin, description: 'General supplier elektrikal dan mekanikal.' });
  // Breadcrumb mirrors the existing visible home/current breadcrumb.
  if (known && index && path !== '/') schema.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${siteOrigin}/` },
    { '@type': 'ListItem', position: 2, name: selected.title, item: canonical.href },
  ] });
  return { title, description: selected.description, canonical: known || product ? canonical.href : undefined, robots: index ? 'index,follow' : 'noindex,follow', schema };
}

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function seoHead(location: string) {
  const m = metadata(location);
  const tag = (name: string, content: string, property = false) => `<meta data-seo ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}">`;
  return [
    `<title data-seo>${escapeHtml(m.title)}</title>`, tag('description', m.description), tag('robots', m.robots),
    m.canonical ? `<link data-seo rel="canonical" href="${escapeHtml(m.canonical)}">` : '',
    tag('og:title', m.title, true), tag('og:description', m.description, true), tag('og:type', 'website', true), tag('og:site_name', siteName, true), tag('og:locale', 'id_ID', true),
    m.canonical ? tag('og:url', m.canonical, true) : '',
    tag('og:image', `${siteOrigin}/images/industrial-overview.jpg`, true), tag('og:image:alt', 'Ilustrasi lingkungan industri', true),
    tag('twitter:card', 'summary_large_image'), tag('twitter:title', m.title), tag('twitter:description', m.description), tag('twitter:image', `${siteOrigin}/images/industrial-overview.jpg`),
    ...m.schema.map(value => `<script data-seo type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`),
  ].join('\n');
}
