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
    init(createWindow);
});

app.on('activate', function () {
    if (window === null) {
        init(createWindow);
    }
});

ipcMain.on('request-upload-window', function(event, arg) {
    createUploadWindow(arg);
});

function init(callback) {
    if (store.has('s3DomainName') && !store.get('s3DomainName') === "") {
        console.log('Has key');
    }
    else {
        initializeStore();
        createPreferencesWindow();
    }

    callback;
}

function initializeStore() {
    store.set('awsAccessKeyId', '');
    store.set('awsSecretAccessKey', '');
    store.set('awsRegion', '');
    store.set('s3BucketName', '');
    store.set('s3DomainName', '');
    store.set('s3CustomDomainName', '');
    store.set('s3InitFolderName');
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

    preferencesWindow.webContents.openDevTools();

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

    uploadWindow.webContents.on('did-finish-load', function() {
        uploadWindow.webContents.send('load-base64Data', base64Data);
    });

    uploadWindow.on('closed', function () {
        uploadWindow = null;
        Menu.setApplicationMenu(menu);
    });
}