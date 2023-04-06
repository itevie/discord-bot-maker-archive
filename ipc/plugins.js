const {
    ipcMain,
    ipcRenderer,
    dialog,
    app
} = require('electron');
const plugins = require(__dirname + "/../extensionLoader.js").plugins


ipcMain.on("pluginList", (event) => {
    event.returnValue = plugins;
});