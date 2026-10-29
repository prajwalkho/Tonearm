import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT_DIR, SONGS_DIR, SUPPORTED_AUDIO, scanSongs } from './song-catalog.mjs';

const manifestSource = await readFile(join(ROOT_DIR, 'songs-manifest.js'), 'utf8');
const manifestJson = manifestSource.match(/^window\.TONEARM_SONGS\s*=\s*(.+);$/m)?.[1];
assert.ok(manifestJson, 'songs-manifest.js must assign the song manifest');
const manifest = JSON.parse(manifestJson);
const diskSongs = await scanSongs();
const sourceFiles = (await readdir(SONGS_DIR, { withFileTypes: true })).filter(entry => entry.isFile() && SUPPORTED_AUDIO.has(entry.name.slice(entry.name.lastIndexOf('.')).toLocaleLowerCase('en-US'))).length;
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
  ['Abhimanyu - Raanjha ｜｜ Shoorveer Abhimanyu Rap Song ｜｜ Mahabharat Rap Song ｜｜ 2024.m4a', 'Abhimanyu'],
  ['Agam - Krishna Ki Chetavani (Rashmirathi) ｜ Shreeman Narayan Narayan Hari Hari ｜ Krishna Bhajan.m4a', 'Krishna Ki Chetavani'],
  ['Agam - Ram Ki Chetavani ft. Siddharth Sharma ｜ Raghupati Raghav Raja Ram ｜ Mangal Bhawan, Ram Bhajan.m4a', 'Ram Ki Chetavani'],
  ['Angad- Raanjha ｜｜ Angad Ravan Samvad ｜｜ Ramayan Rap Song ｜｜ Hindi Rap Song ｜｜ 2025.m4a', 'Angad Ravan Samvad'],
  ['Hanuman Ji Ki Surya Ko Chetavani ｜ Hanuman Rap Song ｜ Lakshman & Sanjeevani ｜ Ramayan.mp3', 'Hanuman Ji Ki Surya Ko Chetavani'],
  ['Jai Bajrangi (The Beginning) ｜｜ Part-1 ｜｜ Ravan ｜｜ Red Sky Records.m4a', 'Jai Bajrangi'],
  ['Jai Sri Ram and Jai Hanuman.m4a', 'Jai Sri Ram and Jai Hanuman'],
  ['Lakshman Parshuram - Raanjha ｜｜ Ramayan Rap Song ｜｜ Motivational & Energetic Rap Song ｜｜ 2025.m4a', 'Lakshman Parshuram'],
  ['Mahavatar Narsingh - Raanjha ｜｜ Narsimha Rap Song ｜｜ Hindi Rap ｜｜ 2025.m4a', 'Mahavatar Narsingh'],
  ['Mahaveer Hanuman- Raanjha ｜｜ Hanuman Ji Powerfull Rap Song ｜｜ Hindi Rap Song ｜｜ 2025.m4a', 'Mahaveer Hanuman'],
  ['Main He Wo Krishna- Shlovij ｜ Prod. X Zeus ｜ Story Of Lord Krishna.m4a', 'Main He Wo Krishna'],
  ['Ramdoot Hanuman- Raanjha ｜｜ Lanka Dahan ｜｜ Ramayan Rap Song ｜｜ Hindi Rap Song ｜｜ 2025.m4a', 'Ramdoot Hanuman'],
  ['Sankatmochan Hanuman- Raanjha ｜｜ Sanjeevani Boonti ｜｜ Ramayan Rap Song ｜｜ Hindi Rap Song ｜｜ 2026.m4a', 'Sankatmochan Hanuman'],
  ['Vastraharan - Raanjha ｜｜ Mahabharat Rap Song ｜｜ Motivational & Energetic Rap Song ｜｜ 2024.m4a', 'Vastraharan'],
  ['Wahi Abhimanyu hu Mai (Official Lyrical Video) ｜｜ Ravan ｜ Red Sky Records.m4a', 'Wahi Abhimanyu Hu Mai'],
  ['Wahi Karn hu Mai (Official Lyrical Video) ｜｜ Ravan ｜ Red Sky Records.m4a', 'Wahi Karn Hu Mai'],
  ['अगर रावण अपनी कहानी खुद सुनाता... ｜ मैं वो रावण हूँ.. ｜ Ravan\'s Story Like Never Before ｜ Ram Song.m4a', 'Main Wo Ravan Hoon'],
  ['तुम राम बन जाओ, मैं रावण ही ठीक हूँ 🔥 ｜ Ravan Rap ｜ Ramayan Song ｜ Hindi Mythology Song.m4a', 'तुम राम बन जाओ, मैं रावण ही ठीक हूँ'],
  ['Angad Lalkaar (अंगद ललकार ) ｜ Narci ｜ Abhilipsa Panda ｜ Myaan Kashyap I Hindi Rap (Prod. By Narci).m4a', 'Angad Lalkaar'],
  ['Arjun - Raanjha ｜｜ Shoorveer Arjun Rap Song ｜｜ Mahabharat Rap Song ｜｜ 2024.m4a', 'Shoorveer Arjun'],
  ['Bhagavān ｜ Mahabharat Rap Song - Siddharth ｜ Krishna\'s Role in Mahabharat ｜ Hindi Rap Song ｜ भगवान.m4a', 'Bhagavān'],
  ['Chakravyuh- The Legend of Abhimanyu ｜ Narci ｜ Hindi Rap Song.m4a', 'Chakravyuh'],
  ['DHARM ADHARM - LUCKE ｜ Krishna X Karn Rap Song ｜ Shoorveer Karn ｜  @HareParmatmane.m4a', 'Dharm Adharm'],
  ['Dharm Adharm ｜ Karn x Shree Krishna Hindi Rap Song ｜ LUCKE.m4a', 'Dharm Adharm (Short Version)'],
  ['Kali Vs Kalki - Epic Rap Battle ｜ Hindi Rap.mp3', 'Kali Vs Kalki'],
  ['Kaliyug Vs Hanuman - Vayuu (Epic Rap Battle) ｜ Hanuman Powerful Energy ｜ Hindi Rap.m4a', 'Kaliyug Vs Hanuman'],
  ['Kalyug Ka Danav ｜ Hindi Rap Song ｜ DK ｜ Ft. Aevi Ajay.m4a', 'Kalyug Ka Danav'],
  ['Karn Ki Gatha Rap ｜ सूयपुत्र कर्ण का महायुद्ध Anthem ⚡ High Energy Epic Mahabharat Rap 2025.m4a', 'Karn Ki Gatha'],
  ['Krishnvani(Official Lyrical Video) ｜｜ Ravan ｜｜ Red Sky Records.m4a', 'Krishnvani'],
  ['Main Ravan Hun ｜ Rap Song ｜ Karan Chopra.m4a', 'Main Ravan Hun'],
  ['Paramavatar ｜ Goosebumps Guaranteed🔥 ｜ Hindi Rap Song ｜ LUCKE ｜ AI Video.m4a', 'Paramavatar'],
  ['Parmeshwar- Raanjha ｜｜ Krishna Arjun Rap Song ｜｜ Mahabharat Rap Song ｜｜ Geeta Gyan ｜｜ 2025.m4a', 'Parmeshwar'],
  ['Sooryaputra Karn - Raanjha ｜｜ Daanveer Karn Rap Song ｜｜ Mahabharat Rap Song ｜｜ 2025 ｜｜ 2026.m4a', 'Sooryaputra Karn'],
  ['पाँच गाँव — कृष्ण का अंतिम संकल्प ｜ Mahabharat Cinematic Rap ｜ श्री कृष्ण × दुर्योधन.m4a', 'पाँच गाँव'],
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

const html = await readFile(join(ROOT_DIR, 'index.html'), 'utf8');
const curatedSource = html.match(/const CURATED_PLAYLISTS=(\[[\s\S]*?\]);\s*const MOOD_PLAYLISTS/)?.[1];
assert.ok(curatedSource, 'index.html must define the protected curated playlists');
const curatedPlaylists = Function(`"use strict";return ${curatedSource}`)();
for (const playlist of curatedPlaylists) {
  const uniqueFiles = new Set(playlist.files.map(file => file.normalize('NFC').toLocaleLowerCase('en-US')));
  assert.equal(uniqueFiles.size, playlist.files.length, `${playlist.name} must not include duplicate song files`);
  for (const file of playlist.files) assert.ok(byFile.has(file.normalize('NFC').toLocaleLowerCase('en-US')), `${playlist.name} references unavailable song ${file}`);
}

assert.equal(manifest.length, diskSongs.length, 'manifest and Songs/ must contain the same number of audio files');

// Verify active artwork and brand paths with exact case. This catches errors
// that can be hidden by a case-insensitive development filesystem but fail on
// Linux static hosts such as Vercel and GitHub Pages.
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
console.log(`Catalog check passed: ${manifest.length} unique songs from ${sourceFiles} supported source files, unique IDs, metadata and durations, all listed files present.`);
console.log(`Curated playlist check passed: ${curatedPlaylists.length} protected playlists reference available, non-duplicate tracks.`);
console.log(`Static asset check passed: ${new Set(artworkPaths).size} playlist artwork files, brand logo, artist artwork, and favicon exist with exact case.`);
console.log('App player check passed: same-origin harness page and local script are present.');
