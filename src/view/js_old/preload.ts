import {contextBridge} from 'electron';
import {ipcRenderer} from 'electron';

const api = {
  loadWindowContents: (name: string) =>
    ipcRenderer.sendSync('loadWindowContents', name),
};

export {api as api};

contextBridge.exposeInMainWorld('api', api);
