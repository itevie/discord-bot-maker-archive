import Discord from 'discord.js';
import Bot from '../../models/Bot';

export function init(client: Discord.Client, bot: Bot) {
  client.on('messageCreate', (message: Discord.Message) => {
    console.log(message.content);
  });
}
