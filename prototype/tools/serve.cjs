const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = fs.realpathSync(path.resolve(__dirname, '..'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function insideRoot(target) {
  return target === root || target.startsWith(root + path.sep);
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const candidate = path.resolve(root, `.${pathname}`);
  if (!insideRoot(candidate)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const target = candidate === root ? path.join(root, 'index.html') : candidate;
  fs.realpath(target, (realError, realTarget) => {
    if (realError || !insideRoot(realTarget)) {
      res.writeHead(realError ? 404 : 403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(realError ? 'Not found' : 'Forbidden');
    }
    fs.stat(realTarget, (statError, stat) => {
      if (statError || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found');
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(realTarget)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(realTarget).pipe(res);
    });
  });
});

server.on('error', (error) => {
  const reason = error.code === 'EADDRINUSE' ? '端口已占用' : error.message;
  console.error(`无法启动 http://127.0.0.1:4173：${reason}`);
  process.exitCode = 1;
});

server.listen(4173, '127.0.0.1', () => {
  console.log('本地游戏地址：http://127.0.0.1:4173');
});
