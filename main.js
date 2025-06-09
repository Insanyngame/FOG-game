// Import the necessary modules from Electron
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Global reference to the main window to prevent it from being garbage collected
let mainWindow;

// This function will create a new BrowserWindow and load the index.html into it.
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800, // Set initial width of the window
        height: 600, // Set initial height of the window
        minWidth: 400, // Set minimum width for resizing
        minHeight: 300, // Set minimum height for resizing
        webPreferences: {
            // IMPORTANT: Enable Node.js integration for renderer process for full Electron features.
            // Be cautious with nodeIntegration and contextIsolation in production apps,
            // as it can expose renderer process to Node.js APIs directly.
            nodeIntegration: true,
            // To ensure compatibility, especially with older Electron versions or specific libraries,
            // contextIsolation is often set to false. For security, it's recommended to enable it
            // and use a preload script for secure IPC.
            contextIsolation: false,
            // A preload script runs before the renderer process content loads.
            // It has access to both Node.js environment and browser APIs.
            // Example: path.join(__dirname, 'preload.js')
            // For this simple example, we are not using a preload script.
        },
        // Optional: Path to an application icon. This icon will be used for the executable.
        // Make sure to provide actual icon files (e.g., icon.png, icon.ico, icon.icns)
        // in your project root or specified path.
        icon: path.join(__dirname, 'icon.png') // Example: path to a generic icon.
    });

    // Load the index.html of the app.
    // Use `file://${__dirname}/index.html` to correctly load local HTML files,
    // ensuring all relative paths to CSS, JS, and images in subfolders work.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // Uncomment the line below to open developer tools for debugging.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// When the Electron app is ready, create the window.
// This event is fired when Electron has finished initializing and
// is ready to create browser windows.
app.whenReady().then(() => {
    createWindow();

    // On macOS, it's common for applications and their menu bar to stay active
    // until the user quits explicitly with Cmd + Q.
    app.on('activate', () => {
        // If there are no windows open, create a new one.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Optional: Customize the application menu.
    // This removes the default Electron menu and allows you to build your own.
    // For a simple app, you might not need a custom menu.
    const isMac = process.platform === 'darwin';
    const template = [
        // App Menu (macOS only)
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // File Menu
        {
            label: 'File',
            submenu: [
                isMac ? { role: 'close', label: 'Close Window' } : { role: 'quit', label: 'Quit App' }
            ]
        },
        // Edit Menu
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                // Mac-specific edit menu items
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    // Windows/Linux specific edit menu items
                    { role: 'delete' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // View Menu
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // Window Menu (macOS only)
        ...(isMac ? [{
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        }] : []),
        // Help Menu
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed, except on macOS.
// On macOS, applications and their menu bar are kept active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
