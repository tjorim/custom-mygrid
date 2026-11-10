import { cp, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Stage the entire set (including its manifest) before touching the live files.
// A failed directory promotion restores the old set; a failed restoration keeps
// the backup on disk and reports its location for manual recovery.
export async function writeSnapshotSet(directory, files, move = rename) {
  const destination = fileURLToPath(directory);
  const temporary = await mkdtemp(path.join(path.dirname(destination), '.upstream-update-'));
  const staged = path.join(temporary, 'staged');
  const backup = path.join(temporary, 'backup');
  let preserveBackup = false;
  try {
    await cp(destination, staged, { recursive: true });
    for (const file of files) {
      const target = path.resolve(staged, file.path);
      if (!target.startsWith(staged + path.sep)) throw new Error(`Invalid snapshot path: ${file.path}`);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.data);
    }
    await move(destination, backup);
    try {
      await move(staged, destination);
    } catch (error) {
      try {
        await move(backup, destination);
      } catch (restoreError) {
        preserveBackup = true;
        throw new AggregateError([error, restoreError], `Snapshot restoration failed. Recover the original set from ${backup}`);
      }
      throw error;
    }
  } finally {
    if (!preserveBackup) await rm(temporary, { recursive: true, force: true });
  }
}
