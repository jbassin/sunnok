import { Message } from 'discord.js';
import { PrefixCommand } from './commands';
import { embedAs, Host, sendAs, void_beyond } from './hosts';
import { ExtendedClient } from './main';
import { addInsight } from './schema';

const text = {
  1: 'An odd sight strains your mind, expanding your consciousness.',
  2: 'The weight of the unfamiliar stretches the limits of your mind.',
  3: "An encounter with the beyond grants clarity, broadening your mind's horizons.",
  4: 'A confrontation of the incomprehensible changes you, imparting insight.',
  5: 'You momentarily peeked beyond the veil, revealing unfathomable truth.',
};

const command: PrefixCommand = {
  name: 'mind',
  help: "Expands the party's spirit",
  perms: { type: 'admin' },

  async run(args: string[], message: Message<boolean>, client: ExtendedClient) {
    async function send(host: Host, text: string) {
      const embed = embedAs(host, null, text);
      await sendAs(host, message.channelId, client, { embeds: [embed] });
    }

    const quantity = parseInt(args[0], 10);
    if (isNaN(quantity) || quantity > 5 || quantity < 1) {
      throw `Quantity couldn't be parsed: ${args}`;
    }

    await send(void_beyond, `${text[quantity]} (+${quantity})`);
    await addInsight(client.schema, quantity);
  },
};

export default command;
