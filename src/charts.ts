import { compareAsc, sub } from 'date-fns';
import { Message } from 'discord.js';
import { writeFile } from 'fs';
import * as exporter from 'highcharts-export-server';
import * as tmp from 'tmp';
import { PrefixCommand } from './commands';
import { players } from './data';
import { Host, rector_ashmont, sendAs } from './hosts';
import { ExtendedClient } from './main';
import { getRolls } from './schema';

export function createChart(settings: any): Promise<string> {
  return new Promise((resolve, reject) => {
    exporter.initPool();

    exporter.export(settings, (err, { data }) => {
      exporter.killPool();

      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function bucketRolls(
  rolls: { value: number; base: number; player: string }[],
  base: number,
) {
  return Object.entries(
    rolls
      .filter(({ base: curBase }) => base === curBase)
      .reduce(
        (acc, con) => {
          return { ...acc, [con.value]: acc[con.value] + 1 };
        },
        (() => {
          const acc = {};
          for (let i = 1; i <= base; i++) {
            acc[i] = 0;
          }

          return acc;
        })(),
      ),
  )
    .sort(
      ([lhs], [rhs]) => (lhs as unknown as number) - (rhs as unknown as number),
    )
    .map(([, val]) => val);
}

export async function getAllRollsChart(client: ExtendedClient, base: number) {
  const rolls = await getRolls(client.schema);
  const buckets = bucketRolls(rolls, base);

  return createChart({
    type: 'jpeg',
    options: {
      title: 'Rolls',
      chart: {
        type: 'column',
      },
      legend: false,
      credits: false,
      xAxis: {
        categories: Array.from({ length: base }, (_, idx) =>
          (idx + 1).toString(),
        ),
      },
      yAxis: {
        min: 0,
        text: 'Count',
      },
      series: [
        {
          name: 'Dice',
          color: rector_ashmont.color,
          data: buckets,
        },
      ],
    },
  });
}

export async function getUserRollsChart(
  client: ExtendedClient,
  base: number,
  span: number | null,
) {
  const filterDate = (() => {
    if (span) {
      const beginning = sub(Date.now(), { days: span });
      return (time: Date) => compareAsc(beginning, time) === -1;
    }

    return (_: Date) => true;
  })();

  const rolls = await getRolls(client.schema);
  const userBuckets = (user) =>
    bucketRolls(
      rolls.filter(({ player, time }) => player === user && filterDate(time)),
      base,
    );

  return createChart({
    type: 'jpeg',
    options: {
      title: 'Rolls',
      chart: {
        type: 'column',
      },
      credits: false,
      xAxis: {
        categories: Array.from({ length: base }, (_, idx) =>
          (idx + 1).toString(),
        ),
      },
      yAxis: {
        min: 0,
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: '#000000',
          },
        },
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLables: {
            enabled: true,
          },
        },
      },
      series: players.map(({ name, color }) => {
        const data = userBuckets(name);
        return {
          name,
          color,
          data,
        };
      }),
    },
  });
}

export const playerChartCommand: PrefixCommand = {
  name: 'player-plot',
  help: 'Plot all of the dice rolls in the chat.',
  perms: { type: 'all' },

  async run(args: string[], message: Message<boolean>, client: ExtendedClient) {
    async function send(host: Host, filename: string) {
      return await sendAs(host, message.channelId, client, {
        files: [filename],
      });
    }

    if (!args[0]) return;
    const base = parseInt(args[0].replace('d', ''), 10);
    if (isNaN(base)) return;

    const chart = await getUserRollsChart(client, base, null);

    const filename: string = await new Promise((resolve, reject) => {
      tmp.file({ postfix: '.png' }, (err, filename) => {
        if (err) reject(err);

        writeFile(filename, chart, 'base64', (err) => {
          if (err) reject(err);
          resolve(filename);
        });
      });
    });
    await send(rector_ashmont, filename);
  },
};

export const weekChartCommand: PrefixCommand = {
  name: 'week-plot',
  help: "Plot last week's dice rolls in the chat.",
  perms: { type: 'all' },

  async run(args: string[], message: Message<boolean>, client: ExtendedClient) {
    async function send(host: Host, filename: string) {
      return await sendAs(host, message.channelId, client, {
        files: [filename],
      });
    }

    if (!args[0]) return;
    const base = parseInt(args[0].replace('d', ''), 10);
    if (isNaN(base)) return;

    const chart = await getUserRollsChart(client, base, 6);

    const filename: string = await new Promise((resolve, reject) => {
      tmp.file({ postfix: '.png' }, (err, filename) => {
        if (err) reject(err);

        writeFile(filename, chart, 'base64', (err) => {
          if (err) reject(err);
          resolve(filename);
        });
      });
    });
    await send(rector_ashmont, filename);
  },
};
