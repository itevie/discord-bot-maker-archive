const {
    contextBridge,
    ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getCurrentEmbed: () => ipcRenderer.sendSync("getCurrentEmbed", null),
    updateEmbed: (data) => ipcRenderer.send("updateEmbed", data),
    closeEmbed: () => ipcRenderer.send("closeEmbed")
});