import sources from '../../upstream/sources.json' with { type: 'json' };
import path from 'node:path';

export const manifest = sources;
export const importedPages = manifest.sources.flatMap(repo => repo.pages.map(page => ({
  ...page, repository: repo.repository, revision: repo.revision, branch: repo.branch,
  file: `upstream/${repo.repository.split('/')[1]}/${page.path}`,
})));
export const upstreamPage = source => importedPages.find(page => page.file === source || page.source === source);
export function upstreamUrl(url, source, image = false) {
  const page = importedPages.find(page => page.file === source);
  if (!page) return undefined;
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
  const [, pathname, suffix = ''] = url.match(/^([^?#]*)(.*)$/);
  if (!pathname) return url;
  const target = path.posix.normalize(pathname.startsWith('/') ? pathname.slice(1) : path.posix.join(path.posix.dirname(page.path), pathname));
  const published = importedPages.find(other => other.repository === page.repository && other.path === target);
  if (published && !image) return { source: published.source, suffix };
  return image
    ? `https://raw.githubusercontent.com/${page.repository}/${page.revision}/${target}${suffix}`
    : `https://github.com/${page.repository}/blob/${page.revision}/${target}${suffix}`;
}
