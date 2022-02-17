import {
  ColorResolvable,
  MessageEmbed,
  WebhookMessageOptions,
} from 'discord.js';
import { ExtendedClient } from './main';

export type Host = {
  name: string;
  image: string;
  color: ColorResolvable;
};

export const hali: Host = {
  name: 'Hali',
  image: 'https://i.imgur.com/bWSBQBc.png',
  color: '#c41e3a',
};

export const tenno: Host = {
  name: 'Tenno',
  image: 'https://i.imgur.com/TZzDA2f.png',
  color: '#7df9ff',
};

export const void_beyond: Host = {
  name: 'The Void Beyond',
  image: 'https://i.imgur.com/sIxjMYW.png',
  color: '#7b00ff',
};

export function embedAs(host: Host, title: string | null, contents: string) {
  const embed = new MessageEmbed()
    .setDescription(contents)
    .setColor(host.color);

  if (title) {
    embed.setTitle(title);
  }
  return embed;
}

export async function sendAs(
  host: Host,
  channel: string,
  client: ExtendedClient,
  message: WebhookMessageOptions,
) {
  const webhook = client.webhooks.get(channel);

  return await webhook.send({
    ...message,
    username: host.name,
    avatarURL: host.image,
  });
}
