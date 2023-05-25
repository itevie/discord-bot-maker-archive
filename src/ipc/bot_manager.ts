import {ipcMain, ipcRenderer} from 'electron';
import Logger from '../Logger';
import Database from '../database';
import {database, default as actions} from '../database';
import {startBot, getList, stopBot} from '../bot_runner';
import {mainWindow} from '../index';
import validateDiscordToken from '../util/validate_discord_token';
import Bot from '../models/Bot';
const logger = new Logger('ipc');

ipcMain.on('createBot', (event, data: SimpleBotData) => {
  logger.log(`Creating bot with name ${data.name}`);
  validateDiscordToken(data.token)
    .then(() => {
      // Create bot
      Database.bots
        .create(data)
        .then(() => {
          event.returnValue = [true];
        })
        .catch(err => {
          event.returnValue = [false, err];
        });
    })
    .catch(message => {
      event.returnValue = [false, message];
    });
});

ipcMain.on('fetchBotList', event => {
  return (event.returnValue = Object.keys(database.bots));
});

ipcMain.on('fetchStartedBots', event => {
  return (event.returnValue = getList());
});

ipcMain.on('fetchBot', (event, botName) => {
  actions.bots
    .fetch(botName)
    .then((bot: Bot) => {
      event.returnValue = bot;
    })
    .catch(err => {
      mainWindow.webContents.send('error', {
        title: 'Failed to fetch bot',
        text: err.message,
        icon: 'error',
      });
    });
});

ipcMain.on('startBot', (event, name: string) => {
  startBot(name)
    .then(() => {
      // The bot has started
    })
    .catch((err: Error) => {
      console.log(err);
      mainWindow.webContents.send('error', {
        title: 'Failed to start bot',
        text: err.message,
        icon: 'error',
      });
    });
});

ipcMain.on('stopBot', (event, name: string) => {
  stopBot(name)
    .then(() => {
      mainWindow.webContents.send('updateBotLists');
    })
    .catch(err => {
      mainWindow.webContents.send('error', {
        title: 'Failed to stop bot',
        text: err.message,
        icon: 'error',
      });
    });
});
