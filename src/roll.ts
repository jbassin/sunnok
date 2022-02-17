import { randomInt } from 'crypto';
import { Message } from 'discord.js';
import { getPlayer } from './data';
import { embedAs, hali, Host, sendAs, tenno } from './hosts';
import { ExtendedClient } from './main';
import { Rolled } from './parser';
import { recordRoll } from './schema';

function tenno_lines(goodness: 'fumble' | 'bad' | 'okay' | 'good' | 'crit') {
  const lines = (() => {
    switch (goodness) {
      case 'fumble':
        return [
          'I dropped the die on the floor and got this. Is it bad?',
          'I tried really hard and got you a one!',
          "Look on the bright side, life can't get worse!",
        ];
      case 'bad':
        return [
          "I think something's wrong with your dice.",
          'I rolled this one a few times, it was always bad.',
          "Sometimes _Fortune_ just isn't in your favor.",
        ];
      case 'okay':
        return [
          "Back home we used to call a roll like this 'okay'.",
          "Hey, your luck's on the rise! Bet you'll do even better next time.",
          'That could have been so much worse! You have to look on the bright side.',
        ];
      case 'good':
        return [
          "Honestly, you're doing great and I'm proud of you.",
          'This is really good, you must be practicing your dice skills!',
          'Out of all your rolls, this one is my new favorite.',
        ];
      case 'crit':
        return [
          'Your number is the biggest number there is!',
          "One crit, served freshly stolen from _Dispair_'s jaws.",
          'Not just anyone could roll as high as you did!',
        ];
    }
  })();

  return lines[randomInt(3)];
}

function hali_lines(goodness: 'fumble' | 'bad' | 'okay' | 'good' | 'crit') {
  const lines = (() => {
    switch (goodness) {
      case 'fumble':
        return [
          "While I can't claim this is on purpose, I can claim it's hilarious.",
          'I have absolutely no doubt you deserve this in some form.',
          "I know they say size isn't everything, but you're really testing that.",
        ];
      case 'bad':
        return [
          'This roll is exactly in line with what I expect of you.',
          "While unfortunate, this isn't exactly unprecedented.",
          'Your suffering and my amusment are directly correlated.',
        ];
      case 'okay':
        return [
          "This is certainly one of the most rolls I've ever seen.",
          'Average is better than I thought you would do.',
          "I have to believe you're just not trying hard enough.",
        ];
      case 'good':
        return [
          'I set the bar low, but you managed to pass it.',
          'Even a broken clock rolls high twice a day.',
          'This is a good roll, how uncharacteristic of you.',
        ];
      case 'crit':
        return [
          "I don't know how much you bribed _Fortune_ for this, but was it worth it?",
          "For once, you've actually done something worthy of praise.",
          'A crit! Much more exciting than your normal fare.',
        ];
    }
  })();

  return lines[randomInt(3)];
}

export async function handleRoll(
  { repr, value, rolls, goodness }: Rolled,
  message: Message<boolean>,
  client: ExtendedClient,
) {
  const player = getPlayer(message.author.id);
  async function send(host: Host, text: string, result: string) {
    let embed = embedAs(host, `${player.char}: ${value}`, text).addField(
      'Result',
      result,
    );

    if (player.img) embed = embed.setThumbnail(player.img);
    await sendAs(host, message.channelId, client, { embeds: [embed] });
  }

  const result = `${repr} = \`${value}\``;
  if (randomInt(2) === 0) {
    await send(tenno, tenno_lines(goodness), result);
  } else {
    await send(hali, hali_lines(goodness), result);
  }

  for (const roll of rolls) {
    await recordRoll(client.schema, player.name, roll);
  }
}
