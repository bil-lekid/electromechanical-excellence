import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'artifacts/seo-ssr', emptyOutDir: true } });
const { render, seoHead, seoPages, siteOrigin } = await import(pathToFileURL(resolve('artifacts/seo-ssr/entry-server.js')).href);
const template = await readFile('dist/index.html', 'utf8');
const head = (html, route) => html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n${seoHead(route)}\n<!-- seo:end -->`);
// Hosting must use this noindex shell for unreviewed dynamic products, never the homepage.
await writeFile('dist/app-shell.html', head(template, '/unreviewed-route'));
for (const route of [...Object.keys(seoPages), '/404']) {
  const html = head(template, route).replace('<div id="root"></div>', `<div id="root">${await render(route)}</div>`);
  const target = route === '/404' ? 'dist/404.html' : route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.entries(seoPages).filter(([, p]) => p.index).map(([path]) => `  <url><loc>${siteOrigin}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots = `User-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`;
for (const directory of ['public', 'dist']) {
  await writeFile(`${directory}/sitemap.xml`, sitemap);
  await writeFile(`${directory}/robots.txt`, robots);
}
console.log(`Prerendered ${Object.keys(seoPages).length} routes plus 404. Sitemap includes ${Object.values(seoPages).filter(p => p.index).length} reviewed static routes; no imported products.`);
