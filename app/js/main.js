const {ipcRenderer} = require('electron');

let input = document.querySelector('textarea');

ipcRenderer.on('req:content', (event, arg) => {
    ipcRenderer.send('res:content', input.value);
});

ipcRenderer.on('file:open', (event, data) => {
    input.value = data.content;
});