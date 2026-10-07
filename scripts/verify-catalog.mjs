import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT_DIR, SONGS_DIR, scanSongs } from './song-catalog.mjs';

const manifestSource = await readFile(join(ROOT_DIR, 'songs-manifest.js'), 'utf8');
const manifestJson = manifestSource.match(/^window\.TONEARM_SONGS\s*=\s*(.+);$/m)?.[1];
assert.ok(manifestJson, 'songs-manifest.js must assign the song manifest');
const manifest = JSON.parse(manifestJson);
const diskSongs = await scanSongs();
const byFile = new Map(manifest.map(song => [song.file.normalize('NFC').toLocaleLowerCase('en-US'), song]));
const byId = new Set();

assert.equal(byFile.size, manifest.length, 'manifest filenames must be unique');
for (const song of diskSongs) {
  const key = song.file.normalize('NFC').toLocaleLowerCase('en-US');
  const saved = byFile.get(key);
  assert.ok(saved, `missing manifest entry for ${song.file}`);
  assert.equal(saved.id, song.id, `unstable song ID for ${song.file}`);
  assert.ok(Number.isSafeInteger(saved.id) && !byId.has(saved.id), `duplicate/invalid ID for ${song.file}`);
  byId.add(saved.id);
  assert.equal(saved.title, song.title, `stale title for ${song.file}`);
  assert.equal(saved.artist, song.artist, `stale artist for ${song.file}`);
  assert.equal(saved.album, song.album, `stale album for ${song.file}`);
  const durationKnownByGenerator = ['.mp3', '.m4a', '.wav'].includes(song.file.slice(song.file.lastIndexOf('.')).toLocaleLowerCase('en-US'));
  if (durationKnownByGenerator) assert.ok(Number.isFinite(saved.durationSeconds) && saved.durationSeconds > 0, `missing duration for ${song.file}`);
  await access(join(SONGS_DIR, song.file));
}

assert.equal(manifest.length, diskSongs.length, 'manifest and Songs/ must contain the same number of audio files');
console.log(`Catalog check passed: ${manifest.length} songs, unique IDs, metadata and durations, all files present.`);
