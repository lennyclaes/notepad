const electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, dialog, globalShortcut } = require('electron');
const fs = require('fs');

let mainWindow;

let filename = '';

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false
    });

    mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    createmenu();
    setShortcuts();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
});

function setShortcuts() {
    globalShortcut.register('CommandOrControl+Alt+S', () => {
        saveFileAs();
    });

    globalShortcut.register('CommandOrControl+S', () => {
        saveFile();
    });

    globalShortcut.register('CommandOrControl+O', () => {
        openFile();
    });
}

function createmenu() {
    const template = [{
        label: 'File',
        submenu: [
            {
                label: 'Open',
                click() {
                    openFile();
                }
            },
            {
                label: 'Save',
                click() {
                    saveFile();
                }
            },
            {
                label: 'Save as',
                click() {
                    saveFileAs();
                }
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'toggledevtools'}
        ]
    }];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function saveFileAs() {
    dialog.showSaveDialog({filters: [{name: 'NoteJS File', extensions: ['txtx']}]}, (name) => {
        if(typeof name !== 'undefined') {
            mainWindow.webContents.send('req:content', '');
            ipcMain.once('res:content', (event, arg) => {
                let fileData = {
                    headers: {},
                    content: arg
                }
    
                fileData = JSON.stringify(fileData);
    
                fileData = Buffer.from(fileData).toString('base64');

                filename = name;
    
                fs.writeFile(filename, fileData, (err => {
                    if(err) throw err;
                }));
            });  
        }
    });
}

function saveFile() {
    if(filename !== '') {
        mainWindow.webContents.send('req:content', '');
        ipcMain.once('res:content', (event, arg) => {
            let fileData = {
                headers: {},
                content: arg
            }

            fileData = JSON.stringify(fileData);

            fileData = Buffer.from(fileData).toString('base64');

            fs.writeFile(filename, fileData, (err => {
                if(err) throw err;
            }));
        });  
    } else {
        saveFileAs();
    }
}

function openFile() {
    dialog.showOpenDialog([{
        properties: ['openFile'],
    },
    {
        name: 'NoteJS File', extensions: ['txtx']
    }], (filename) => {
        if(filename) {
            let fileData;
            fs.readFile(filename[0], (err, data) => {
                if(err) throw err;
                fileData = Buffer.from(data.toString(), 'base64').toString('ascii');

                fileData = JSON.parse(fileData);

                mainWindow.webContents.send('file:open', fileData);
            }); 
        }
    });
}