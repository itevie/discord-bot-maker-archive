import {ipcMain} from 'electron';

ipcMain.on('test', () => {
  console.log('It worked!');
});
