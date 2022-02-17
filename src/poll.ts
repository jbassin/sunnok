import { randomInt } from 'crypto';
import { Message } from 'discord.js';
import { APIMessage } from 'discord.js/node_modules/discord-api-types';
import { PrefixCommand } from './commands';
import { embedAs, hali, Host, sendAs, tenno } from './hosts';
import { ExtendedClient } from './main';

const command: PrefixCommand = {
  name: 'poll',
  help: "Confirming which day of the week we'll play.",
  perms: { type: 'all' },

  async run(_: string[], message: Message<boolean>, client: ExtendedClient) {
    async function send(host: Host, text: string) {
      const embed = embedAs(host, null, text);
      return await sendAs(host, message.channelId, client, { embeds: [embed] });
    }

    let poll: Message<boolean> | APIMessage;
    if (randomInt(2) === 0) {
      poll = await send(
        tenno,
        "Hi friends! Scheduling can be difficult, so I'd appreciate it if you could select when you'd like to meet this week!\n\n0️⃣ Monday\n1️⃣ Wednesday\n2️⃣ Other",
      );
    } else {
      poll = await send(
        hali,
        'Fleshbags, your naturally chaotic lives need order. Choose the day when you prefer to meet.\n\n0️⃣ Monday\n1️⃣ Wednesday\n2️⃣ Other',
      );
    }

    const pollMsg = await message.channel.messages.fetch(poll.id);
    await pollMsg.react('0️⃣');
    await pollMsg.react('1️⃣');
    await pollMsg.react('2️⃣');
  },
};

export default command;
