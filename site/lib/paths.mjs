// Kept independent of Astro so config, Markdown transforms and tests share routing.
import path from 'node:path';

export const base = '/custom-mygrid/';
export const repository = 'https://github.com/tjorim/custom-mygrid';
export const siteUrl = (route = '') => base + route.replace(/^\/+/, '');

export function documentRoute(source) {
  if (source === 'site/README.md') return 'docs/website/';
  if (!source.startsWith('docs/') || !source.endsWith('.md')) return undefined;
  const slug = source.slice(5, -3).replace(/(^|\/)README$/, '$1');
  return `docs/${slug}${slug && !slug.endsWith('/') ? '/' : ''}`;
}

// Resolve relative URLs from the Markdown source, never from its published URL.
export function rewriteUrl(url, source) {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
  const [, pathname, suffix = ''] = url.match(/^([^?#]*)(.*)$/);
  if (!pathname) return url;
  const target = path.posix.normalize(pathname.startsWith('/')
    ? pathname.slice(1) : path.posix.join(path.posix.dirname(source), pathname));
  const route = documentRoute(target);
  if (route !== undefined) return siteUrl(route) + suffix;
  if (target.startsWith('assets/') || target.startsWith('docs/assets/') || target === 'LICENSE') {
    return siteUrl(target) + suffix;
  }
  // Other repository files remain available from their source.
  return `${repository}/blob/main/${target}${suffix}`;
}
