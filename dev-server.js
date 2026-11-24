// Local Development & Preview Server for Dr. Surabhi Knee & Back Pain Clinic
// Serves static frontend from dist/ and dynamically executes serverless API routes from api/

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env.local if present
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  });
}

const PORT = parseInt(process.env.PORT || '8080', 10);
const DIST_DIR = path.join(__dirname, 'dist');
const API_DIR = path.join(__dirname, 'api');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const REWRITES = {
  '/': '/index.html',
  '/blog': '/blog/index.html',
  '/blog/': '/blog/index.html',
  '/admin': '/admin.html',
  '/confirmation': '/confirmation.html',
  '/thank-you': '/confirmation.html',
  '/pay-upi': '/pay-upi.html',
  '/payment': '/payment.html',
  '/pay': '/payment.html',
  '/about-us': '/about-us.html',
  '/free-whatsapp-consultation': '/free-whatsapp-consultation.html',
  '/whatsapp-consultation': '/free-whatsapp-consultation.html',
  '/privacy-policy': '/privacy-policy.html',
  '/shipping-policy': '/shipping-policy.html',
  '/shipping-and-return-policy': '/shipping-and-return-policy.html',
  '/refund-policy': '/refund-policy.html',
  '/terms': '/terms.html',
  '/terms-and-conditions': '/terms-and-conditions.html',
  '/webinar': '/index.html',
  '/room': '/index.html'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ---------------------------------------------------------------------------
  // A. Serverless API Routing (/api/*)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    const routeName = pathname.replace('/api/', '').split('/')[0];
    const apiFile = path.join(API_DIR, `${routeName}.js`);

    if (fs.existsSync(apiFile)) {
      try {
        // Collect request body
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString();

        req.query = Object.fromEntries(parsedUrl.searchParams.entries());
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          req.body = rawBody;
        }

        // Add helper methods expected by Vercel serverless handlers
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        const module = await import(`${apiFile}?t=${Date.now()}`);
        const handler = module.default || module;
        await handler(req, res);
        return;
      } catch (err) {
        console.error(`API Route Error [/api/${routeName}]:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal API Server Error', details: err.message }));
        return;
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `API route /api/${routeName} not found` }));
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // B. Static Files Serving (dist/*)
  // ---------------------------------------------------------------------------
  let targetPath = REWRITES[pathname] || pathname;
  let filePath = path.join(DIST_DIR, targetPath);

  // If path is a directory, look for index.html inside it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    }
  }

  // If path doesn't have an extension, try appending .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', mime);
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 fallback to index.html for SPA-like navigation
    const indexFallback = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexFallback)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      fs.createReadStream(indexFallback).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌿 Dr. Surabhi Knee & Back Pain Clinic - Local Server`);
  console.log(`======================================================`);
  console.log(`📍 Local URL:     http://localhost:${PORT}`);
  console.log(`📋 Admin URL:     http://localhost:${PORT}/admin.html`);
  console.log(`📲 Direct UPI:    http://localhost:${PORT}/pay-upi`);
  console.log(`⚡ API Endpoints: http://localhost:${PORT}/api/cal-direct`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.log(`Port ${PORT} in use, trying ${fallbackPort}...`);
    server.listen(fallbackPort, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});
