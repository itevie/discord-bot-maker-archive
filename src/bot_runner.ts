import Discord from 'discord.js';
import actions from './database';
import Bot from './models/Bot';
import Logger from './Logger';
import {mainWindow} from './index';
import * as events from './discord/events/init';
import validateDiscordToken from './util/validate_discord_token';
const logger = new Logger('bot-runner');

const startedBots: Dictionary<Discord.Client> = {};
const startingBots: string[] = [];

export function getList(): string[] {
  return Object.keys(startedBots);
}

export function stopBot(botName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Check if it is running
    if (!startedBots[botName])
      return reject(new Error(`The bot ${botName} is not running`));

    // Stop the bot
    startedBots[botName].destroy();
    delete startedBots[botName];
    logger.log(`Stopped bot: ${botName}`);

    resolve();
  });
}

export function startBot(botName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Check if bot is already starting
    if (startingBots.includes(botName))
      return reject(new Error(`The bot ${botName} is alrady starting`));
    startingBots.push(botName);

    // Check if the bot exists
    actions.bots
      .exists(botName)
      .then(() => {
        // Fetch the bot
        actions.bots
          .fetch(botName)
          .then((bot: Bot) => {
            // Check if bot is already started
            if (startedBots[bot.name]) {
              return reject(
                new Error(`The bot ${botName} has already been started!`)
              );
            }

            // Validate the token
            validateDiscordToken(bot.token)
              .then(() => {
                // Create the client
                const client = new Discord.Client({
                  intents: [
                    Discord.GatewayIntentBits.MessageContent,
                    Discord.GatewayIntentBits.Guilds,
                    Discord.GatewayIntentBits.GuildMessages,
                  ],
                });

                // Register main events
                client.on('ready', () => {
                  logger.log(`Bot ${botName} has successfully started!`);

                  // Add bot to startedBots
                  startedBots[bot.name] = client;

                  // Load events
                  Object.keys(events).forEach(event => {
                    events[event as keyof typeof events].init(client, bot);
                    logger.log(`Loaded event: ${event} for bot ${bot.name}`);
                  });

                  mainWindow.webContents.send('updateBotLists');
                  startingBots.splice(startingBots.indexOf(botName), 1);
                });

                // Login
                client.login(bot.token).catch((err: Error) => {
                  startingBots.splice(startingBots.indexOf(botName), 1);
                  reject(err);
                });
              })
              .catch((err: Error) => {
                startingBots.splice(startingBots.indexOf(botName), 1);
                reject(err);
              });
          })
          .catch((err: Error) => {
            startingBots.splice(startingBots.indexOf(botName), 1);
            reject(err);
          });
      })
      .catch((err: Error) => {
        startingBots.splice(startingBots.indexOf(botName), 1);
        reject(err);
      });
  });
}
