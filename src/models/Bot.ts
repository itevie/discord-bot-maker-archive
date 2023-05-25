import {database} from '../database';
import Logger from '../Logger';
import Command from './Command';
const logger = new Logger('class_db:bot');

export default class Bot {
  name: string;
  token: string;
  prefix: string;
  commands: Dictionary<Command>;

  constructor(data: BotData) {
    this.name = data.name;
    this.token = data.token;
    this.prefix = data.prefix || '!';
    this.commands = data.commands;
  }

  setName(name: string) {
    return new Promise<void>((resolve, reject) => {
      logger.log('Set bot ' + this.name + ' name to ' + name);
      database.bots
        .updateName(this.name, name)
        .then(() => {
          this.name = name;
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }
}
