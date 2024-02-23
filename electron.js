const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    const isDev = process.env.NODE_ENV === 'development';

    // Load the React app from the development server if in development mode,
    // otherwise load from the build directory
    const startUrl = isDev
        ? 'http://localhost:3000' // Adjust if your dev server runs on a different port
        : url.format({
              pathname: path.join(__dirname, '/build/index.html'),
              protocol: 'file:',
              slashes: true,
          });
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    // Open the DevTools automatically if in development mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
};

const startFlaskApp = () => {
    const scriptPath = path.join(__dirname, 'run.py');
    const flaskApp = spawn('python', [scriptPath]);

    flaskApp.stdout.on('data', (data) => {
        console.log(`Flask stdout: ${data}`);
    });

    flaskApp.stderr.on('data', (data) => {
        console.error(`Flask stderr: ${data}`);
    });

    flaskApp.on('close', (code) => {
        console.log(`Flask process exited with code ${code}`);
    });
};

app.on('ready', () => {
    startFlaskApp();
    createWindow();
});
