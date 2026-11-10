import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeSnapshotSet } from './snapshot-files.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mygrid-snapshots-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'upstream');
  await mkdir(directory);
  await writeFile(path.join(directory, 'guide.md'), 'old guide');
  await writeFile(path.join(directory, 'sources.json'), 'old manifest');
  return { root, directory: pathToFileURL(directory + path.sep) };
}
const updates = [
  { path: 'guide.md', data: 'new guide' },
  { path: 'sources.json', data: 'new manifest' },
];
async function contents(directory) {
  return Promise.all(['guide.md', 'sources.json'].map(file => readFile(new URL(file, directory), 'utf8')));
}

test('publishes snapshots and manifest as one staged set', async t => {
  const { root, directory } = await fixture(t);
  await writeSnapshotSet(directory, updates);
  assert.deepEqual(await contents(directory), ['new guide', 'new manifest']);
  assert.deepEqual(await readdir(root), ['upstream']);
});

test('a staging write failure leaves the live set untouched', async t => {
  const { root, directory } = await fixture(t);
  // sources.json is a file, so writing a child beneath it must fail after the
  // first staged guide write, before either live file has been replaced.
  await assert.rejects(writeSnapshotSet(directory, [updates[0], { path: 'sources.json/child', data: 'bad' }]));
  assert.deepEqual(await contents(directory), ['old guide', 'old manifest']);
  assert.deepEqual(await readdir(root), ['upstream']);
});

test('a promotion failure restores the original snapshots and manifest', async t => {
  const { root, directory } = await fixture(t);
  let calls = 0;
  await assert.rejects(writeSnapshotSet(directory, updates, async (from, to) => {
    if (++calls === 2) throw new Error('injected promotion failure');
    await rename(from, to);
  }), /injected promotion failure/);
  assert.deepEqual(await contents(directory), ['old guide', 'old manifest']);
  assert.deepEqual(await readdir(root), ['upstream']);
});

test('a restoration failure preserves the backup and reports its location', async t => {
  const { root, directory } = await fixture(t);
  let calls = 0;
  await assert.rejects(writeSnapshotSet(directory, updates, async (from, to) => {
    if (++calls >= 2) throw new Error('injected move failure');
    await rename(from, to);
  }), /Recover the original set from/);
  const [temporary] = await readdir(root);
  const backup = pathToFileURL(path.join(root, temporary, 'backup') + path.sep);
  assert.deepEqual(await contents(backup), ['old guide', 'old manifest']);
});
