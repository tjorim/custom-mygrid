// Refresh snapshots only on explicit request; normal builds verify offline.
import { readFile } from 'node:fs/promises';
import { writeSnapshotSet } from './snapshot-files.mjs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const manifestFile = new URL('upstream/sources.json', root);
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
const update = process.argv.includes('--update');
const digest = data => createHash('sha256').update(data).digest('hex');
async function fetchChecked(url) {
  const response = await fetch(url, { headers: process.env.GH_TOKEN && url.startsWith('https://api.github.com/') ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {} });
  if (!response.ok) {
    const hint = !process.env.GH_TOKEN && url.startsWith('https://api.github.com/')
      && [403, 429].includes(response.status)
      ? ' GitHub may have rate-limited this request; set GH_TOKEN for authenticated access.' : '';
    throw new Error(`${url}: ${response.status}.${hint}`);
  }
  return response;
}
const downloads = [];
for (const repo of manifest.sources) {
  if (update) repo.revision = (await (await fetchChecked(`https://api.github.com/repos/${repo.repository}/commits/${repo.branch}`)).json()).sha;
  if (!/^[a-f0-9]{40}$/.test(repo.revision)) throw new Error(`Invalid revision: ${repo.repository}`);
  for (const page of [...repo.pages, ...(repo.files ?? [])]) {
    const file = new URL(`upstream/${repo.repository.split('/')[1]}/${page.path}`, root);
    const data = update ? Buffer.from(await (await fetchChecked(`https://raw.githubusercontent.com/${repo.repository}/${repo.revision}/${page.path}`)).arrayBuffer()) : await readFile(file);
    if (update) { page.sha256 = digest(data); downloads.push({ path: `${repo.repository.split('/')[1]}/${page.path}`, data }); }
    else if (digest(data) !== page.sha256) throw new Error(`Snapshot modified: ${fileURLToPath(file)}. Edit the upstream source and run pnpm docs:update.`);
  }
}
// Stage all downloads and the manifest together, then promote with rollback.
if (update) {
  downloads.push({ path: 'sources.json', data: JSON.stringify(manifest, null, 2) + '\n' });
  await writeSnapshotSet(new URL('upstream/', root), downloads);
}
console.log(`${update ? 'Updated' : 'Verified'} ${manifest.sources.length} pinned documentation repositories.`);
