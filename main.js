const { app, BrowserWindow, Menu } = require('electron');
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
                    openPreferencesWindow();
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

app.once('ready', function () {
    createWindow();
});

app.on('activate', function () {
    if (window === null) {
        createWindow();
    }
})

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