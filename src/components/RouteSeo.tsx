import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoHead } from '@/lib/seo';

export default function RouteSeo() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.head.querySelectorAll('[data-seo]').forEach(node => node.remove());
    const template = document.createElement('template');
    template.innerHTML = seoHead(pathname + search);
    document.head.append(template.content);
  }, [pathname, search]);
  return null;
}
