const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const store = new Store();

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
let uploadWindow = null;

app.once('ready', function () {
    init(createWindow);
});

app.on('activate', function () {
    if (window === null) {
        init(createWindow);
    }
});

ipcMain.on('reload-main-window', function() {
    reloadWindow();
});

ipcMain.on('create-upload-window', function(event, arg) {
    createUploadWindow(arg);
});

ipcMain.on('close-preferences-window', function() {
    closePreferencesWindow();
});

ipcMain.on('setup-complete', function() {
    store.set('setupComplete', true);
});

function init(callback) {
    createWindow();

    initializeStore();
    if (store.get('setupComplete') === '') {
        createPreferencesWindow();
    }

    callback;
}

function initializeStore() {
    initializeStoreValue('setupComplete');
    initializeStoreValue('awsAccessKeyId');
    initializeStoreValue('awsSecretAccessKey');
    initializeStoreValue('awsRegion');
    initializeStoreValue('s3BucketName');
    initializeStoreValue('s3DomainName');
    initializeStoreValue('s3CustomDomainName');
    initializeStoreValue('s3InitFolderName');
}

function initializeStoreValue(storeValue) {
    if (!store.has(storeValue)) {
        store.set(storeValue, '');
        return true;
    }
    else {
        return false;
    }
}

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
        app.quit();
    });
}

function reloadWindow() {
    window.reload();
}

function createPreferencesWindow() {    
    preferencesWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false
    });

    preferencesWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/views/preferences.html'),
        protocol: 'file',
        slashes: true
    }));

    preferencesWindow.webContents.openDevTools();

    preferencesWindow.on('closed', function () {
        preferencesWindow = null;
        Menu.setApplicationMenu(menu);
    });
}

function closePreferencesWindow() {
    preferencesWindow.close();
}

function createUploadWindow(base64Data) {
    uploadWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false
    });

    uploadWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/views/upload.html'),
        protocol: 'file',
        slashes: true
    }));

    uploadWindow.webContents.on('did-finish-load', function() {
        uploadWindow.webContents.send('load-base64Data', base64Data);
    });

    uploadWindow.on('closed', function () {
        uploadWindow = null;
    });
}