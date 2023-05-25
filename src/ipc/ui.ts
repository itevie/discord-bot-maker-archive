import {ipcMain} from 'electron';
import {response} from '../util/conditionals';

ipcMain.on('confirmFunctionResponse', (event, data) => {
  response(data.id, data.response);
});
