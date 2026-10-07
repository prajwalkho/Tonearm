import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SONGS_DIR = join(ROOT_DIR, 'Songs');
export const SUPPORTED_AUDIO = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.oga', '.wav', '.opus', '.flac']);
const DEFAULT_ARTIST = 'Prajwal Khot';
const DEFAULT_ALBUM = 'Tonearm';

export function titleFromFilename(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/([A-Za-z])Version(?=\s*\d)/g, '$1 Version').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stableSongId(filename) {
  const normalized = filename.normalize('NFC').toLocaleLowerCase('en-US');
  return Number.parseInt(createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12), 16);
}

function decodeId3Text(data) {
  if (!data.length) return '';
  const encoding = data[0];
  let textBytes = data.subarray(1);
  if (encoding === 1 || encoding === 2) {
    let bigEndian = encoding === 2;
    if (encoding === 1 && textBytes.length >= 2) {
      if (textBytes[0] === 0xfe && textBytes[1] === 0xff) { bigEndian = true; textBytes = textBytes.subarray(2); }
      else if (textBytes[0] === 0xff && textBytes[1] === 0xfe) { bigEndian = false; textBytes = textBytes.subarray(2); }
    }
    if (bigEndian) {
      const swapped = Buffer.from(textBytes);
      for (let i = 0; i + 1 < swapped.length; i += 2) [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
      textBytes = swapped;
    }
    return textBytes.toString('utf16le').replace(/\0.*$/s, '').trim();
  }
  return textBytes.toString(encoding === 0 ? 'latin1' : 'utf8').replace(/\0.*$/s, '').trim();
}

function synchsafe32(buffer, offset) {
  return ((buffer[offset] & 0x7f) << 21) | ((buffer[offset + 1] & 0x7f) << 14) |
    ((buffer[offset + 2] & 0x7f) << 7) | (buffer[offset + 3] & 0x7f);
}

function readId3(buffer) {
  const tags = {};
  if (buffer.toString('ascii', 0, 3) !== 'ID3' || buffer.length < 10) return tags;
  const version = buffer[3];
  const flags = buffer[5];
  const tagEnd = Math.min(buffer.length, 10 + synchsafe32(buffer, 6));
  let offset = 10;
  if (flags & 0x40 && offset + 4 <= tagEnd) {
    const extendedSize = version === 4 ? synchsafe32(buffer, offset) : buffer.readUInt32BE(offset);
    offset += 4 + extendedSize;
  }
  const names = { TIT2: 'title', TPE1: 'artist', TALB: 'album' };
  while (offset + 10 <= tagEnd) {
    const frameId = buffer.toString('ascii', offset, offset + 4);
    if (!/^[A-Z0-9]{4}$/.test(frameId)) break;
    const frameSize = version === 4 ? synchsafe32(buffer, offset + 4) : buffer.readUInt32BE(offset + 4);
    const contentStart = offset + 10;
    const contentEnd = Math.min(tagEnd, contentStart + frameSize);
    if (contentEnd <= contentStart) break;
    if (names[frameId] && !tags[names[frameId]]) tags[names[frameId]] = decodeId3Text(buffer.subarray(contentStart, contentEnd));
    offset = contentStart + frameSize;
  }
  return tags;
}

const MPEG_BITRATES = {
  '1-1': [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  '1-2': [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  '1-3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  '2-1': [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  '2-2': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  '2-3': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

function mp3Duration(buffer) {
  let offset = 0;
  if (buffer.toString('ascii', 0, 3) === 'ID3' && buffer.length >= 10) offset = 10 + synchsafe32(buffer, 6);
  const end = buffer.length >= 128 && buffer.toString('ascii', buffer.length - 128, buffer.length - 125) === 'TAG' ? buffer.length - 128 : buffer.length;
  let duration = 0;
  let frames = 0;
  while (offset + 4 <= end) {
    const header = buffer.readUInt32BE(offset);
    const versionBits = (header >>> 19) & 3;
    const layerBits = (header >>> 17) & 3;
    const bitrateIndex = (header >>> 12) & 15;
    const sampleIndex = (header >>> 10) & 3;
    if ((header >>> 21) !== 0x7ff || versionBits === 1 || layerBits === 0 || bitrateIndex === 0 || bitrateIndex === 15 || sampleIndex === 3) {
      offset++;
      continue;
    }
    const mpegVersion = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 2.5;
    const layer = 4 - layerBits;
    const tableVersion = mpegVersion === 1 ? 1 : 2;
    const bitrate = MPEG_BITRATES[`${tableVersion}-${layer}`][bitrateIndex] * 1000;
    let sampleRate = [44100, 48000, 32000][sampleIndex];
    if (mpegVersion === 2) sampleRate /= 2;
    if (mpegVersion === 2.5) sampleRate /= 4;
    const padding = (header >>> 9) & 1;
    const frameLength = layer === 1 ? Math.floor(12 * bitrate / sampleRate + padding) * 4 :
      Math.floor((mpegVersion === 1 || layer === 2 ? 144 : 72) * bitrate / sampleRate) + padding;
    if (frameLength < 4 || offset + frameLength > end) { offset++; continue; }
    const samples = layer === 1 ? 384 : layer === 3 && mpegVersion !== 1 ? 576 : 1152;
    duration += samples / sampleRate;
    frames++;
    offset += frameLength;
  }
  return frames ? duration : null;
}

function mp4Atoms(buffer, start, end, visit, depth = 0) {
  if (depth > 14) return;
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) return;
      const wideSize = buffer.readBigUInt64BE(offset + 8);
      if (wideSize > BigInt(Number.MAX_SAFE_INTEGER)) return;
      size = Number(wideSize);
      headerSize = 16;
    } else if (size === 0) size = end - offset;
    if (size < headerSize || offset + size > end) return;
    const payloadStart = offset + headerSize;
    const payloadEnd = offset + size;
    visit(type, payloadStart, payloadEnd);
    const isContainer = ['moov', 'trak', 'mdia', 'minf', 'stbl', 'udta', 'ilst'].includes(type);
    if (isContainer) mp4Atoms(buffer, payloadStart, payloadEnd, visit, depth + 1);
    if (type === 'meta' && payloadStart + 4 <= payloadEnd) mp4Atoms(buffer, payloadStart + 4, payloadEnd, visit, depth + 1);
    offset += size;
  }
}

function m4aMetadata(buffer) {
  const result = { durationSeconds: null, title: '', artist: '', album: '', albumArtist: '' };
  const keys = { '\u00a9nam': 'title', '\u00a9ART': 'artist', aART: 'albumArtist', '\u00a9alb': 'album' };
  mp4Atoms(buffer, 0, buffer.length, (type, start, end) => {
    if (type === 'mvhd' && start + 20 <= end) {
      const version = buffer[start];
      const scaleOffset = start + (version === 1 ? 20 : 12);
      const durationOffset = start + (version === 1 ? 24 : 16);
      if (scaleOffset + 4 <= end) {
        const scale = buffer.readUInt32BE(scaleOffset);
        const duration = version === 1 && durationOffset + 8 <= end ? Number(buffer.readBigUInt64BE(durationOffset)) :
          version === 0 && durationOffset + 4 <= end ? buffer.readUInt32BE(durationOffset) : 0;
        if (scale && duration) result.durationSeconds = duration / scale;
      }
    }
    if (keys[type]) {
      mp4Atoms(buffer, start, end, (childType, dataStart, dataEnd) => {
        if (childType !== 'data' || dataStart + 8 > dataEnd || result[keys[type]]) return;
        const value = buffer.subarray(dataStart + 8, dataEnd).toString('utf8').replace(/\0.*$/s, '').trim();
        if (value) result[keys[type]] = value;
      }, depthForMetadata);
    }
  });
  if (!result.artist) result.artist = result.albumArtist;
  delete result.albumArtist;
  return result;
}

// Metadata item atoms are nested under ilst items; this constant keeps their
// data atom traversal independent of the main movie atom recursion depth.
const depthForMetadata = 1;

function readWavDuration(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') return null;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (type === 'fmt ' && offset + 28 <= buffer.length) {
      const bytesPerSecond = buffer.readUInt32LE(offset + 8 + 8);
      const dataIndex = buffer.indexOf('data', offset + 12, 'ascii');
      if (dataIndex >= 0 && dataIndex + 8 <= buffer.length && bytesPerSecond) return buffer.readUInt32LE(dataIndex + 4) / bytesPerSecond;
    }
    offset += 8 + size + (size & 1);
  }
  return null;
}

async function audioMetadata(filename) {
  const buffer = await readFile(join(SONGS_DIR, filename));
  const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const tags = extension === '.mp3' ? readId3(buffer) : extension === '.m4a' ? m4aMetadata(buffer) : {};
  const duration = extension === '.mp3' ? mp3Duration(buffer) : extension === '.m4a' ? tags.durationSeconds : extension === '.wav' ? readWavDuration(buffer) : null;
  return {
    title: tags.title || titleFromFilename(filename),
    artist: tags.artist || DEFAULT_ARTIST,
    album: tags.album || DEFAULT_ALBUM,
    durationSeconds: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null,
  };
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
  const songs = [];
  for (const filename of files) {
    const key = filename.normalize('NFC').toLocaleLowerCase('en-US');
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    const id = stableSongId(filename);
    const collision = seenIds.get(id);
    if (collision) throw new Error(`Song ID collision between "${collision}" and "${filename}".`);
    seenIds.set(id, filename);
    songs.push({ id, file: filename, ...(await audioMetadata(filename)) });
  }
  const titleFrequency = new Map();
  for (const song of songs) {
    const key = song.title.normalize('NFC').toLocaleLowerCase('en-US');
    titleFrequency.set(key, (titleFrequency.get(key) || 0) + 1);
  }
  return songs.map(song => titleFrequency.get(song.title.normalize('NFC').toLocaleLowerCase('en-US')) > 1
    ? { ...song, title: titleFromFilename(song.file) }
    : song);
}
