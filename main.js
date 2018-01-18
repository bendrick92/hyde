const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let window = null;
let menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Preferences',
                click () {
                    createPreferencesWindow();
                }
            },
            {
                label: 'Toggle Debug',
                click () {
                    window.webContents.toggleDevTools();
                },
                accelerator: 'CommandOrControl+D'
            },
            {
                label: 'Reload',
                click () {
                    window.reload();
                },
                accelerator: 'CommandOrControl+R'
            },
            {
                label: 'Close',
                role: 'close'
            }
        ]
    }
];
let menu = Menu.buildFromTemplate(menuTemplate);
let preferencesWindow = null;
let preferencesMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Close',
                role: 'close'
            }
        ]
    }
];
let preferencesMenu = Menu.buildFromTemplate(preferencesMenuTemplate);
let uploadWindow = null;
let uploadMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Close',
                role: 'close'
            }
        ]
    }
];
let uploadMenu = Menu.buildFromTemplate(uploadMenuTemplate);

app.once('ready', function () {
    createWindow();
});

app.on('activate', function () {
    if (window === null) {
        createWindow();
    }
});

ipcMain.on('request-upload-window', function(event, arg) {
    createUploadWindow(arg);
});

function createWindow() {
    Menu.setApplicationMenu(menu);
    
    window = new BrowserWindow({
        width: 800,
        height: 800
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, 'app/views/index.html'),
        protocol: 'file',
        slashes: true
    }));

    window.on('closed', function () {
        window = null;
    });
}

function createPreferencesWindow() {
    Menu.setApplicationMenu(preferencesMenu);
    
    preferencesWindow = new BrowserWindow({
        width: 400,
        height: 400
    });

    preferencesWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/views/preferences.html'),
        protocol: 'file',
        slashes: true
    }));

    preferencesWindow.on('closed', function () {
        preferencesWindow = null;
        Menu.setApplicationMenu(menu);
    });
}

function createUploadWindow(base64Data) {
    Menu.setApplicationMenu(uploadMenu);

    uploadWindow = new BrowserWindow({
        width: 400,
        height: 400
    });

    uploadWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/views/upload.html'),
        protocol: 'file',
        slashes: true
    }));

    uploadWindow.webContents.openDevTools();

    uploadWindow.webContents.on('did-finish-load', function() {
        uploadWindow.webContents.send('load-base64Data', base64Data);
    });

    uploadWindow.on('closed', function () {
        uploadWindow = null;
        Menu.setApplicationMenu(menu);
    });
}