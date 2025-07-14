const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 4000;
// Get the absolute path to the dist directory
const distPath = path.resolve(process.cwd(), 'dist');
console.log('Current working directory:', process.cwd());
console.log('Resolved dist path:', distPath);

// Verify dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory does not exist at path:', distPath);
  console.error('Current directory contents:', fs.readdirSync(path.dirname(distPath)));
  process.exit(1);
}

// Verify index.html exists in dist
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('Error: index.html not found in dist directory');
  console.error('Dist directory contents:', fs.readdirSync(distPath));
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    // Parse URL
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    
    // Log request details
    console.log(`Pathname: ${pathname}`);
    
    // Handle API routes
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    }
    
    // Normalize the path to prevent directory traversal
    let safePath = path.normalize(pathname).replace(/^(\/|\\)+/, '');
    
    // Default to index.html for root or if the path doesn't have an extension
    if (pathname === '/' || !path.extname(pathname)) {
      safePath = 'index.html';
    }
    
    // Construct the full file path
    let filePath = path.join(distPath, safePath);
    
    // Log file path being accessed
    console.log(`Attempting to serve file: ${filePath}`);
    
    // Get file extension and set content type
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error reading file ${filePath}:`, error);
        
        if (error.code === 'ENOENT') {
          console.log(`File not found: ${filePath}, falling back to index.html`);
          // File not found, serve index.html for SPA routing
          const indexPath = path.join(distPath, 'index.html');
          console.log(`Attempting to serve index.html from: ${indexPath}`);
          
          fs.readFile(indexPath, (err, content) => {
            if (err) {
              console.error('Error serving index.html:', err);
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end(`Server Error: Failed to serve index.html - ${err.code}`);
            } else {
              console.log('Serving index.html');
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            }
          });
        } else {
          // Server error
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        // Success - serve the file
        console.log(`Serving file: ${filePath} (${contentType})`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  } catch (error) {
    console.error('Unhandled error in request handler:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving static files from: ${distPath}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
