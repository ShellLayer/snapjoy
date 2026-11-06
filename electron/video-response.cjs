const { createReadStream } = require('node:fs');
const { stat } = require('node:fs/promises');
const { Readable } = require('node:stream');

// net.fetch(file:) does not expose a consistently seekable response on macOS.
// Serve explicit byte ranges so Chromium can seek without loading a whole clip.
module.exports = async function videoResponse(file, request, extension) {
  const { size } = await stat(file);
  const headers = {
    'Content-Type': extension === 'mp4' ? 'video/mp4' : 'video/webm',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store'
  };
  const range = request.headers.get('range');
  let start = 0, end = size - 1;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const invalid = () => new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
    if (!match || (!match[1] && !match[2]) || !size) return invalid();
    if (match[1]) {
      start = Number(match[1]);
      if (match[2]) end = Math.min(Number(match[2]), size - 1);
    } else {
      const suffix = Number(match[2]);
      if (!Number.isSafeInteger(suffix) || suffix < 1) return invalid();
      start = Math.max(0, size - suffix);
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return invalid();
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = String(Math.max(0, end - start + 1));
  const body = size ? Readable.toWeb(createReadStream(file, { start, end })) : null;
  return new Response(body, { status: range ? 206 : 200, headers });
};
