import Discord from 'discord.js';
import Logger from '../Logger';
const logger = new Logger('token-validator');

export default function (token: string) {
  return new Promise((resolve, reject) => {
    logger.log('Checking token...');

    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.MessageContent],
    });
    logger.log('Client created');

    // This event will be ran if the client successfully connects
    client.on('ready', () => {
      logger.log('The client successfully connected!');
      client.destroy();

      resolve(true);
    });

    client.login(token).catch((err: Discord.DiscordjsError) => {
      logger.log('The client failed to connect: invalid token');

      const message = err.message;

      reject(new Error(message));
    });
  });
}
