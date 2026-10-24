import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const publicDir = new URL('site/public/', root);
await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
await cp(new URL('assets/', root), new URL('assets/', publicDir), { recursive: true });
// Optional documentation images stay next to their Markdown sources.
try {
  await cp(new URL('docs/assets/', root), new URL('docs/assets/', publicDir), { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await cp(new URL('LICENSE', root), new URL('LICENSE', publicDir));
await writeFile(new URL('.nojekyll', publicDir), '');
