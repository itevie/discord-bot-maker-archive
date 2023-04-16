const {
    contextBridge,
    ipcRenderer
} = require('electron');

let rendererEvents = {
    message: null,
    error: null,
    success: null
}

contextBridge.exposeInMainWorld('electron', {
    fetchPluginList: () => ipcRenderer.sendSync("pluginList", null),
    fetchWebActions: () => ipcRenderer.sendSync("fetchWebActions", null),
    fetchCurrentCode: () => ipcRenderer.sendSync("fetchCurrentCode", null),
    updateCurrentCode: (data) => ipcRenderer.send("updateCurrentCode", data),
});