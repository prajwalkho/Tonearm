import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT_DIR, SONGS_DIR, scanSongs } from './song-catalog.mjs';

const manifestSource = await readFile(join(ROOT_DIR, 'songs-manifest.js'), 'utf8');
const manifestJson = manifestSource.match(/^window\.TONEARM_SONGS\s*=\s*(.+);$/m)?.[1];
assert.ok(manifestJson, 'songs-manifest.js must assign the song manifest');
const manifest = JSON.parse(manifestJson);
const diskSongs = await scanSongs();
const byFile = new Map(manifest.map(song => [song.file.normalize('NFC').toLocaleLowerCase('en-US'), song]));
const byId = new Set();
const expectedTitles = new Map([
  ['bhaktambar.m4a', 'Bhaktambar'],
  ['Hanuman aura.mp3', 'Hanuman Aura'],
  ['Hanuman chalisa.mp3', 'Hanuman Chalisa'],
  ['Knowledge of Krishna.mp3', 'Knowledge of Krishna'],
  ['Lakshya (From Lakshya).mp3', 'Lakshya'],
  ['Shiv Tandav Stotram - Shankar Mahadevan- [PagalWorld.NL] (1).mp3', 'Shiv Tandav Stotram'],
  ['Unstoppable - (Raag.Fm).mp3', 'Unstoppable'],
  ['Ziddi Dil - Ranjit Rana.mp3', 'Ziddi Dil'],
]);

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
  const expectedTitle = expectedTitles.get(song.file);
  if (expectedTitle) assert.equal(saved.title, expectedTitle, `unexpected display title for ${song.file}`);
  const durationKnownByGenerator = ['.mp3', '.m4a', '.wav'].includes(song.file.slice(song.file.lastIndexOf('.')).toLocaleLowerCase('en-US'));
  if (durationKnownByGenerator) assert.ok(Number.isFinite(saved.durationSeconds) && saved.durationSeconds > 0, `missing duration for ${song.file}`);
  await access(join(SONGS_DIR, song.file));
}

assert.equal(manifest.length, diskSongs.length, 'manifest and Songs/ must contain the same number of audio files');

// Verify active artwork and brand paths with exact case. This catches errors
// that can be hidden by a case-insensitive development filesystem but fail on
// Linux static hosts such as Vercel and GitHub Pages.
const html = await readFile(join(ROOT_DIR, 'index.html'), 'utf8');
const artworkBlock = html.match(/const PLAYLIST_ARTWORK=\{([\s\S]*?)\};/)?.[1];
assert.ok(artworkBlock, 'index.html must define PLAYLIST_ARTWORK');
const artworkPaths = [...artworkBlock.matchAll(/:\s*'([^']+\.(?:png|jpe?g|svg|webp))'/gi)].map(match => match[1]);
assert.ok(artworkPaths.length > 0, 'PLAYLIST_ARTWORK must include image paths');
const brandLogo = html.match(/const BRAND_LOGO='\.\/([^']+)'/)?.[1];
assert.ok(brandLogo, 'index.html must define BRAND_LOGO');
const artistArtwork = html.match(/\.\/assets\/artists\/([^'"`]+\.svg)/)?.[1];
assert.ok(artistArtwork, 'index.html must reference the director artwork');
const favicon = html.match(/<link\s+rel="icon"[^>]+href="\.\/([^\"]+)"/i)?.[1];
assert.ok(favicon, 'index.html must define a relative favicon path');

async function assertExactPath(relativePath, description) {
  const decoded = decodeURIComponent(relativePath.replaceAll('\\', '/'));
  const parts = decoded.split('/').filter(Boolean);
  let current = ROOT_DIR;
  for (const part of parts) {
    const entries = await readdir(current);
    assert.ok(entries.includes(part), `${description} path has missing or incorrect-case component: ${part} (${relativePath})`);
    current = join(current, part);
  }
  await access(current);
}

for (const artwork of new Set(artworkPaths)) await assertExactPath(artwork, 'Playlist artwork');
await assertExactPath(brandLogo, 'Brand logo');
await assertExactPath(`assets/artists/${artistArtwork}`, 'Artist artwork');
await assertExactPath(favicon, 'Favicon');
const appCheckHtml = await readFile(join(ROOT_DIR, 'scripts', 'app-player-check.html'), 'utf8');
assert.match(appCheckHtml, /<script\s+src="\.\/app-player-check\.js"><\/script>/, 'app player check must load its local script');
assert.match(appCheckHtml, /<iframe[^>]+src="\.\.\/index\.html#\/playlist\/popular"/, 'app player check must embed the project entry point');
await assertExactPath('scripts/app-player-check.js', 'App player check script');
console.log(`Catalog check passed: ${manifest.length} songs, unique IDs, metadata and durations, all files present.`);
console.log(`Static asset check passed: ${new Set(artworkPaths).size} playlist artwork files, brand logo, artist artwork, and favicon exist with exact case.`);
console.log('App player check passed: same-origin harness page and local script are present.');
