#!/usr/bin/env node

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const routeManifest = require('../src/lib/localized-routes.json');

const DEFAULT_DIST_DIR = path.resolve(__dirname, '..', 'dist');
const DEFAULT_PORT = 3000;

const MIME_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function routePattern(routePath) {
  const escapedSegments = routePath
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  return new RegExp(`^/${escapedSegments.join('/')}/?$`);
}

const appRoutePatterns = Object.values(routeManifest.routes)
  .filter((route) => !route.indexable)
  .flatMap((route) => [route.en, route.pl])
  .map(routePattern);

function isAppRoute(urlPath) {
  return appRoutePatterns.some((pattern) => pattern.test(urlPath));
}

function safeRequestPath(rawPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return null;
  }

  if (decodedPath.includes('\0') || decodedPath.includes('\\')) return null;
  const normalized = path.posix.normalize(decodedPath);
  if (!normalized.startsWith('/') || normalized.split('/').includes('..')) return null;
  return normalized;
}

function existingFileForRequest(distDir, urlPath) {
  const relativePath = urlPath.replace(/^\/+/, '');
  const candidates = urlPath.endsWith('/')
    ? [path.join(relativePath, 'index.html')]
    : [relativePath, path.join(relativePath, 'index.html')];

  for (const candidate of candidates) {
    const absolutePath = path.resolve(distDir, candidate || 'index.html');
    const relativeToDist = path.relative(distDir, absolutePath);
    if (relativeToDist.startsWith('..') || path.isAbsolute(relativeToDist)) continue;
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) return absolutePath;
  }
  return null;
}

function responseHeaders(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const immutableAsset = filePath.split(path.sep).includes('assets');
  return {
    'Content-Type': MIME_TYPES.get(extension) || 'application/octet-stream',
    'Cache-Control': immutableAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
}

function sendFile(request, response, filePath, statusCode = 200) {
  const stat = fs.statSync(filePath);
  response.writeHead(statusCode, { ...responseHeaders(filePath), 'Content-Length': stat.size });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  fs.createReadStream(filePath).pipe(response);
}

function sendText(request, response, statusCode, message) {
  const body = Buffer.from(message);
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}

function createDistServer({ distDir = DEFAULT_DIST_DIR } = {}) {
  const resolvedDistDir = path.resolve(distDir);
  const appShellPath = path.join(resolvedDistDir, 'app.html');

  if (!fs.existsSync(appShellPath)) {
    throw new Error(`Missing application shell: ${appShellPath}. Run npm run build first.`);
  }

  return http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      sendText(request, response, 405, 'Method Not Allowed');
      return;
    }

    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const urlPath = safeRequestPath(requestUrl.pathname);
    if (!urlPath) {
      sendText(request, response, 400, 'Bad Request');
      return;
    }

    const existingFile = existingFileForRequest(resolvedDistDir, urlPath);
    if (existingFile) {
      sendFile(request, response, existingFile);
      return;
    }

    if (isAppRoute(urlPath)) {
      sendFile(request, response, appShellPath);
      return;
    }

    if (!path.posix.extname(urlPath)) {
      sendFile(request, response, appShellPath, 404);
      return;
    }

    sendText(request, response, 404, 'Not Found');
  });
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
  const server = createDistServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Serving ${DEFAULT_DIST_DIR} on port ${port}`);
  });
}

module.exports = { createDistServer, isAppRoute };
