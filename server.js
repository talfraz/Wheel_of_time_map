const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Supported MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Normalize URL paths to prevent directory traversal
  let reqUrl = req.url.split('?')[0]; // strip query params
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${reqUrl}`);

  // API Endpoint: GET /api/locations
  if (req.method === 'GET' && reqUrl === '/api/locations') {
    const filePath = path.join(__dirname, 'locations.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Failed to read locations file' }));
      }
      res.writeHead(200, { 
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(data);
    });
    return;
  }

  // API Endpoint: POST /api/save-locations
  if (req.method === 'POST' && reqUrl === '/api/save-locations') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const updatedLocations = JSON.parse(body);
        if (!Array.isArray(updatedLocations)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Data must be an array of locations' }));
        }

        const filePath = path.join(__dirname, 'locations.json');
        fs.writeFile(filePath, JSON.stringify(updatedLocations, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error writing to locations file:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Failed to save locations' }));
          }
          console.log(`Successfully saved ${updatedLocations.length} locations to locations.json`);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, message: 'Locations saved successfully!' }));
        });
      } catch (e) {
        console.error('Failed parsing JSON body:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Serve static files
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  // Sanitize path to prevent directory traversal outside workspace
  const safeSuffix = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safeSuffix);

  fs.stat(filePath, (err, stats) => {
    // If file doesn't exist or is a directory, fall back to index.html (SPA routing behavior)
    if (err || !stats.isFile()) {
      const indexHtmlPath = path.join(__dirname, 'index.html');
      fs.readFile(indexHtmlPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }

    // Determine MIME type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Stream/read the static file content
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Wheel of Time Interactive Map Server is running!`);
  console.log(`  Access the map at: http://localhost:${PORT}`);
  console.log(`  (Uses Node.js native libraries - zero dependencies!)`);
  console.log(`  Press Ctrl+C to stop.`);
  console.log(`==================================================`);
});
