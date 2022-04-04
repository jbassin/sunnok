import { ColorResolvable } from 'discord.js';

export type Player = {
  ids: string[];
  name: string;
  char: string;
  admin: boolean;
  color: ColorResolvable;
  img: string | null;
};

function player(
  ids: string[],
  name: string,
  char: string,
  admin: boolean,
  color: ColorResolvable,
  cls: P2EClass,
): Player {
  return {
    ids,
    name,
    char,
    admin,
    color,
    img: classImg(cls),
  };
}

export type P2EClass =
  | 'alchemist'
  | 'barbarian'
  | 'bard'
  | 'champion'
  | 'cleric'
  | 'druid'
  | 'dm'
  | 'fighter'
  | 'gunslinger'
  | 'inventor'
  | 'investigator'
  | 'magus'
  | 'monk'
  | 'oracle'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'summoner'
  | 'swashbuckler'
  | 'witch'
  | 'wizard';

export function classImg(cls: P2EClass) {
  switch (cls) {
    case 'dm':
      return null;
    default:
      return `https://2e.aonprd.com/Images/Class/${cls}_Icon.png`;
  }
}

export const players: Player[] = [
  player(
    ['333321567926878209', '753011513765134507', '758077038732116100'],
    'josh',
    'The DM',
    true,
    '#1b5e20',
    'dm',
  ),
  player(
    ['712150290169593856', '753011285003730955'],
    'jorge',
    'Desmond Reza',
    false,
    '#e65100',
    'gunslinger',
  ),
  player(
    ['555850241912602631'],
    'mike',
    'Divex Vistok',
    false,
    '#4a148c',
    'wizard',
  ),
  player(
    ['652106046571020299'],
    'noah',
    'Big Fish',
    false,
    '#b71c1c',
    'inventor',
  ),
  player(
    ['417896818844893194'],
    'tanner',
    'Henrik Bosco',
    false,
    '#0d47a1',
    'fighter',
  ),
];

export function getPlayer(id: string): Player {
  return players.find(
    ({ ids }) => ids.find((singleId) => singleId === id) !== undefined,
  );
}

export function isAdmin(id: string): boolean {
  return getPlayer(id).admin;
}

export function getChar(id: string) {
  return getPlayer(id).char;
}
