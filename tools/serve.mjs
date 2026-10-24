import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT ?? 3000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2'
};

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error('PORT must be a number between 0 and 65535.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  const reply = (status, message, headers = {}) => {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
    response.end(request.method === 'HEAD' ? undefined : message);
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    reply(405, 'Method not allowed.', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    reply(400, 'Invalid URL.');
    return;
  }

  let file = resolve(root, '.' + pathname);
  if (!file.startsWith(root + sep) && file !== root) {
    reply(403, 'Access denied.');
    return;
  }
  if (pathname.includes('\0') || pathname.split(/[\\/]/).some(part => part.startsWith('.'))) {
    reply(403, 'Access denied.');
    return;
  }

  let info;
  try {
    info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: new URL(request.url, 'http://localhost').pathname + '/' });
        response.end();
        return;
      }
      file = resolve(file, 'index.html');
      info = await stat(file);
    }
    if (!info.isFile()) throw new Error('Not a regular file.');
  } catch {
    reply(404, 'File not found.');
    return;
  }

  const headers = {
    'Content-Type': types[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  };
  let start = 0;
  let end = info.size - 1;
  let status = 200;

  // Byte ranges let the browser seek through the locally hosted films.
  if (request.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if (!match || (!match[1] && !match[2]) || info.size === 0) {
      reply(416, 'Range not available.', { 'Content-Range': `bytes */${info.size}` });
      return;
    }
    if (match[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    } else {
      const suffix = Number(match[2]);
      start = Math.max(0, info.size - suffix);
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
      reply(416, 'Range not available.', { 'Content-Range': `bytes */${info.size}` });
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
  }

  headers['Content-Length'] = String(info.size === 0 ? 0 : end - start + 1);
  response.writeHead(status, headers);
  if (request.method === 'HEAD' || info.size === 0) {
    response.end();
    return;
  }
  const stream = createReadStream(file, { start, end });
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Stop the other server or set a different PORT.`
    : error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${server.address().port}`);
  console.log('Press Ctrl+C to stop.');
});
