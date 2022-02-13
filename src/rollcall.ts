import { Message } from 'discord.js';
import { PrefixCommand } from './commands';
import { embedAs, hali, Host, sendAs, tenno, void_beyond } from './hosts';
import { ExtendedClient } from './main';

const command: PrefixCommand = {
  name: 'rollcall',
  help: 'Checks to see if anyone is listening',
  perms: { type: 'all' },

  async run(_: string[], message: Message<boolean>, client: ExtendedClient) {
    async function send(host: Host, text: string) {
      const embed = embedAs(host, null, text);
      await sendAs(host, message.channelId, client, { embeds: [embed] });
    }

    await send(tenno, 'I hear you loud and clear!');
    await send(hali, "We're listening, don't be so needy.");
    await send(void_beyond, '...');
  },
};

export default command;
