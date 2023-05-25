import {ipcMain} from 'electron';
import fs from 'fs';
import Logger from '../Logger';
const logger = new Logger('ipc');

const WindowPagesDirectory = __dirname + '/../../../src/view/windows';

ipcMain.on('loadWindowContents', (event, name: string) => {
  const fileName = WindowPagesDirectory + '/' + name + '.html';
  logger.log(`Loading window contents in ${fileName}`);

  // Check if the file exists
  if (fs.existsSync(fileName)) {
    event.returnValue = fs.readFileSync(fileName, 'utf-8');
  } else {
    event.returnValue = null;
  }
});
