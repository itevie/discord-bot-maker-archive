import {app} from 'electron';
import Logger from './Logger';
import fs from 'fs';
import Bot from './models/Bot';

const logger = new Logger('database');

//const userPath = app.getPath('userData');
const dataPath = app.getPath('userData') + '/data.json';

logger.log('Data path is ' + dataPath);

// Check if database file exists
if (fs.existsSync(dataPath) === false)
  fs.writeFileSync(
    dataPath,
    JSON.stringify({
      bots: {},
    })
  );

const database = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

setTimeout(() => {
  actions.bots
    .fetch('b')
    .then(bot => {
      bot.setName('Hello World');
    })
    .catch(err => {
      console.log(err);
    });
}, 100);

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(database));
}

const actions = {
  bots: {
    exists: (name: string): Promise<boolean> => {
      return new Promise<boolean>(resolve => {
        if (database.bots[name]) resolve(true);
        else resolve(false);
      });
    },

    fetch: (name: string): Promise<Bot> => {
      return new Promise<Bot>((resolve, reject) => {
        if (!database.bots[name])
          return reject(`A bot with name ${name} does not exist`);
        else resolve(new Bot(database.bots[name]));
      });
    },

    create: (data: SimpleBotData): Promise<Bot> => {
      return new Promise<Bot>((resolve, reject) => {
        logger.log('Creating new bot: ' + data.name);

        // Check if bot exists
        actions.bots
          .exists(data.name)
          .then((exists: Boolean) => {
            // It does not exist
            if (exists === true)
              return reject(
                'A bot with the name ' + data.name + ' already exists'
              );

            // It exists
            logger.log('Bot has unique name: ' + data.name);

            // Create it
            const bot: Bot = new Bot(data as BotData);
            database.bots[data.name] = bot;
            save();

            logger.log('New bot created!');
            resolve(bot);
          })
          .catch((err: Error) => {
            // An error occurred
            reject(err);
          });
      });
    },

    // UPDATING ACTIONS
    updateName(oldName: string, newName: string): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        actions.bots.exists(oldName).then((exists: boolean) => {
          if (!exists) reject(`The bot with name ${oldName} does not exist`);
          const temp = structuredClone(database.bots[oldName]);
          delete database.bots[oldName];
          database.bots[newName] = temp;
          database.bots[newName].name = newName;
          save();
          resolve();
        });
      });
    },
  },
};

export default actions;
export {database, save};
