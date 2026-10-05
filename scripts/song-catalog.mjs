import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SONGS_DIR = join(ROOT_DIR, 'Songs');
export const SUPPORTED_AUDIO = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.oga', '.wav', '.opus', '.flac']);

export function titleFromFilename(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stableSongId(filename) {
  const normalized = filename.normalize('NFC').toLocaleLowerCase('en-US');
  return Number.parseInt(createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12), 16);
}

export async function scanSongs() {
  let entries;
  try {
    entries = await readdir(SONGS_DIR, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const files = entries
    .filter(entry => entry.isFile() && SUPPORTED_AUDIO.has(entry.name.slice(entry.name.lastIndexOf('.')).toLocaleLowerCase('en-US')))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  const seenNames = new Set();
  const seenIds = new Map();
  return files.filter(filename => {
    const key = filename.normalize('NFC').toLocaleLowerCase('en-US');
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    const id = stableSongId(filename);
    const collision = seenIds.get(id);
    if (collision) throw new Error(`Song ID collision between "${collision}" and "${filename}".`);
    seenIds.set(id, filename);
    return true;
  }).map(file => ({
    id: stableSongId(file),
    file,
    title: titleFromFilename(file),
    artist: 'Prajwal Khot',
    album: 'Local Collection',
  }));
}
