const fs = require('fs');
const path = require('path');

// Get version - using timestamp or package.json version
const timestamp = Date.now();
// OR: const { version } = require('./package.json');
const version = timestamp.toString();

// Create version.json
fs.writeFileSync(
  path.join(__dirname, 'build', 'version.json'),
  JSON.stringify({ version })
);

// Inject into service worker
const swPath = path.join(__dirname, 'build', 'service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(
  /const CACHE_VERSION = ['"].*?['"];/,
  `const CACHE_VERSION = 'app-cache-${version}';`
);
fs.writeFileSync(swPath, swContent);

console.log(`Version ${version} injected into both files`);
