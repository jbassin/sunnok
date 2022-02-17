import { Message } from 'discord.js';
import insight from './insight.js';
import { ExtendedClient } from './main.js';
import rollcall from './rollcall.js';
import poll from './poll.js';
import { embedAs, hali, sendAs, tenno } from './hosts.js';
import { randomInt } from 'crypto';

export type PrefixCommand = {
  name: string;
  help: string;
  perms: { type: 'all' } | { type: 'admin' };
  run:
    | ((args: string[]) => Promise<void>)
    | ((args: string[], message: Message<boolean>) => Promise<void>)
    | ((
        args: string[],
        message: Message<boolean>,
        client: ExtendedClient,
      ) => Promise<void>);
};

const prefixCommands: PrefixCommand[] = [insight, poll, rollcall];

export function getCommands() {
  const help: PrefixCommand = {
    name: 'help',
    help: 'Displays help for commands',
    perms: { type: 'all' },

    async run(_: string[], message: Message<boolean>, client: ExtendedClient) {
      function generateHelp(commands: PrefixCommand[], isAll = false) {
        const gap = Math.max(...commands.map(({ name }) => name.length)) + 1;
        return (
          isAll
            ? [
                ...commands,
                {
                  name: 'help',
                  help: 'This command! Displays help for commands',
                },
              ]
            : commands
        )
          .sort(({ name: lhs }, { name: rhs }) => lhs.localeCompare(rhs))
          .map(({ name, help }) => `-${name.padEnd(gap, ' ')} . ${help}`)
          .join('\n');
      }

      const allCommands = prefixCommands.filter(
        ({ perms: { type } }) => type === 'all',
      );
      const adminCommands = prefixCommands.filter(
        ({ perms: { type } }) => type === 'admin',
      );

      if (randomInt(2) === 0) {
        await sendAs(tenno, message.channelId, client, {
          embeds: [
            embedAs(
              tenno,
              null,
              'I went a made a whole list of all the things everyone is allowed to do!',
            ).addField(
              'Help -- All',
              `\`\`\`${generateHelp(allCommands, true)}\`\`\``,
            ),
          ],
        });
        await sendAs(hali, message.channelId, client, {
          embeds: [
            embedAs(
              hali,
              null,
              "Though you're a lesser being with no right to use these commands, if you were an administrator you could.",
            ).addField(
              'Help -- Administrator',
              `\`\`\`${generateHelp(adminCommands, false)}\`\`\``,
            ),
          ],
        });
      } else {
        await sendAs(hali, message.channelId, client, {
          embeds: [
            embedAs(
              hali,
              null,
              'Despite your ...status, someone has degined to all you access to these commands.',
            ).addField(
              'Help -- All',
              `\`\`\`${generateHelp(allCommands, true)}\`\`\``,
            ),
          ],
        });
        await sendAs(tenno, message.channelId, client, {
          embeds: [
            embedAs(
              tenno,
              null,
              "Even though these commands are only for administrators, I believe one day you'll get to use them too!",
            ).addField(
              'Help -- Administrator',
              `\`\`\`${generateHelp(adminCommands, false)}\`\`\``,
            ),
          ],
        });
      }
    },
  };

  return [...prefixCommands, help];
}
