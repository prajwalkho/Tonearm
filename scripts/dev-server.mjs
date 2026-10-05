import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { ROOT_DIR, scanSongs } from './song-catalog.mjs';

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.mp3', 'audio/mpeg'], ['.m4a', 'audio/mp4'], ['.aac', 'audio/aac'], ['.ogg', 'audio/ogg'], ['.oga', 'audio/ogg'],
  ['.opus', 'audio/ogg'], ['.wav', 'audio/wav'], ['.flac', 'audio/flac'],
]);

function sendError(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(message);
}

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) return sendError(res, 405, 'Method not allowed');

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch {
    return sendError(res, 400, 'Invalid URL');
  }

  if (pathname === '/api/songs') {
    try {
      const songs = await scanSongs();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(req.method === 'HEAD' ? undefined : JSON.stringify(songs));
    } catch (error) {
      console.error('Unable to scan Songs/:', error.message);
      return sendError(res, 500, 'Unable to read the Songs folder');
    }
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const requestedPath = resolve(ROOT_DIR, relativePath);
  const relativeCheck = relative(ROOT_DIR, requestedPath);
  if (relativeCheck === '..' || relativeCheck.startsWith(`..${sep}`) || relativeCheck.startsWith(sep)) {
    return sendError(res, 403, 'Forbidden');
  }

  try {
    const actualPath = await realpath(requestedPath);
    const actualRelative = relative(ROOT_DIR, actualPath);
    if (actualRelative === '..' || actualRelative.startsWith(`..${sep}`) || actualRelative.startsWith(sep)) {
      return sendError(res, 403, 'Forbidden');
    }
    const info = await stat(actualPath);
    if (!info.isFile()) return sendError(res, 404, 'Not found');

    const headers = {
      'Content-Type': MIME.get(extname(actualPath).toLocaleLowerCase('en-US')) || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    };
    let start = 0, end = info.size - 1;
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
        return res.end();
      }
      if (!match[1]) {
        const suffix = Number(match[2]);
        start = Math.max(0, info.size - suffix);
      } else {
        start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), end);
      }
      if (start >= info.size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
        return res.end();
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      headers['Content-Length'] = end - start + 1;
      res.writeHead(206, headers);
    } else {
      headers['Content-Length'] = info.size;
      res.writeHead(200, headers);
    }

    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(actualPath, { start, end });
    stream.on('error', error => {
      console.error('Unable to serve file:', error.message);
      if (!res.headersSent) sendError(res, 500, 'Unable to read file');
      else res.destroy(error);
    });
    stream.pipe(res);
  } catch (error) {
    return sendError(res, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
  }
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, '127.0.0.1', () => console.log(`Tonearm live sync server: http://127.0.0.1:${port}`));
