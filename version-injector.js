const fs = require('fs');
const path = require('path');

// Get version from package.json with timestamp suffix
// This creates versions that change on each build but are still trackable
const { version } = require('./package.json');
const buildTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp (seconds)
const versionString = `${version}-${buildTimestamp}`;

console.log(`Using version: ${versionString}`);

// Create version.json
const versionJson = path.join(__dirname, 'build', 'version.json');
fs.writeFileSync(versionJson, JSON.stringify({ version: versionString }));
console.log(`Version information written to ${versionJson}`);

// Inject into service worker
const swPath = path.join(__dirname, 'build', 'service-worker.js');
if (fs.existsSync(swPath)) {
    console.log(`Injecting version ${versionString} into service worker`);
    let swContent = fs.readFileSync(swPath, 'utf8');

    // Make sure we're replacing the right string
    const cacheVersionRegex = /const CACHE_VERSION = ['"].*?['"];/;
    if (cacheVersionRegex.test(swContent)) {
        swContent = swContent.replace(
            cacheVersionRegex,
            `const CACHE_VERSION = 'app-cache-${versionString}';`
        );
        fs.writeFileSync(swPath, swContent);
        console.log(
            `Successfully injected version ${versionString} into service worker cache`
        );
    } else {
        console.error('Could not find CACHE_VERSION in service worker');
    }
} else {
    console.log('Service worker file not found, skipping injection');
}

// Create an offline.html page if it doesn't exist
const offlinePath = path.join(__dirname, 'build', 'offline.html');
if (!fs.existsSync(offlinePath)) {
    fs.writeFileSync(
        offlinePath,
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paxxium - Offline</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
    .container { text-align: center; padding: 2rem; max-width: 600px; }
    h1 { color: #333; }
    p { color: #666; line-height: 1.6; }
    button { background-color: #3f51b5; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 20px; }
    button:hover { background-color: #303f9f; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>`
    );
    console.log('Created offline.html file');
}

console.log(`Version ${versionString} injection complete`);
