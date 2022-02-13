import { Message } from 'discord.js';
import insight from './insight.js';
import { ExtendedClient } from './main.js';
import rollcall from './rollcall.js';

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

export const prefixCommands: PrefixCommand[] = [insight, rollcall];
