import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient } from '@tanstack/react-query';
import { PassThrough } from 'node:stream';
import { AppContent } from './App';
export { seoHead, seoPages, siteOrigin, metadata } from './lib/seo';

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on('data', chunk => chunks.push(Buffer.from(chunk)));
    output.on('end', () => { client.clear(); resolve(Buffer.concat(chunks).toString()); });
    output.on('error', reject);
    const stream = renderToPipeableStream(<StaticRouter location={url}><AppContent client={client} /></StaticRouter>, {
      onAllReady() { stream.pipe(output); },
      onShellError: reject,
      onError: reject,
    });
  });
}
