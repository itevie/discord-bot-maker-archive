const {
    contextBridge,
    ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getConfig: () => ipcRenderer.sendSync("getConfig", null),
    openExternalLink: (url) => ipcRenderer.send("openExternalLink", url),
    closeAbout: (url) => ipcRenderer.send("closeAbout")
});