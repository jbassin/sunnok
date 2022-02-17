import { Client, Collection, Intents, Webhook } from 'discord.js';
import { Sequelize } from 'sequelize';
import { getCommands, PrefixCommand } from './commands.js';
import { guildIds, prefix, token } from './config.js';
import { isAdmin } from './data.js';
import { roll } from './parser.js';
import { handleRoll } from './roll.js';
import { Schema, setSchema } from './schema.js';

export type ExtendedClient = Client & {
  sql: Sequelize;
  schema: Schema;
  commands: Collection<string, PrefixCommand>;
  webhooks: Collection<string, Webhook>;
};

const sql = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false,
});

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}) as ExtendedClient;

client.sql = sql;
client.commands = new Collection();
client.webhooks = new Collection();

for (const command of getCommands()) {
  client.commands.set(command.name, command);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.webhookId) return;

  const dice = roll(message.content);
  if (dice) {
    await handleRoll(dice, message, client);
    return;
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLocaleLowerCase();

  if (!client.commands.has(command)) return;
  const commandObj = client.commands.get(command);

  if (commandObj.perms.type === 'admin' && !isAdmin(message.author.id)) return;

  try {
    await commandObj.run(args, message, client);
  } catch (error) {
    console.error(error);
    await message.reply({
      content: `There was an error executing this command!\n${error}`,
    });
  }
});

client.once('ready', async () => {
  for (const guildId of guildIds) {
    const channels = await client.guilds.cache.get(guildId).channels.fetch();
    for (const channel of channels.values()) {
      if (!channel.isText()) continue;

      const webhookName = 'hali-and-tenno';
      const webhooks = await channel.fetchWebhooks();
      let webhook = webhooks.find((webhook) => webhook.name === webhookName);

      if (!webhook) {
        webhook = await channel.createWebhook(webhookName, {
          reason: 'To allow Hali and Tenno to speak through multiple forms.',
        });
      }

      client.webhooks.set(channel.id, webhook);
    }
  }

  try {
    client.schema = setSchema(sql);
    await sql.authenticate();
    await sql.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  console.log('Hali and Tenno are ready for duty!');
});

client.login(token);
