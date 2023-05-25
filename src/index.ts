import {app, BrowserWindow} from 'electron';
import {confirmRunFunction} from './util/conditionals';
import path = require('path');
import Logger from './Logger';
require('./database');
require('./ipc');
const logger = new Logger('main');

let mainWindow: Electron.BrowserWindow;
let closeConfirmed = false;

app.on('ready', () => {
  logger.log('App content loading...');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '/../../src/view/js/preload/main.js'),
    },
    icon: __dirname + '/icon.ico',
  });

  const indexHTML = path.join(__dirname + '/../../src/view/index.html');
  mainWindow.loadFile(indexHTML).then(() => {
    logger.log('Successfully loaded main file');
  });

  mainWindow.on('close', e => {
    if (!closeConfirmed) {
      confirmRunFunction('Are you sure you want to quit?', () => {
        closeConfirmed = true;
        mainWindow.close();
      });

      e.preventDefault();
    }
  });

  logger.log('Main window finished initiating');
});

export {mainWindow};
