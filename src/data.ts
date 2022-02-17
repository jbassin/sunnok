export type Player = {
  ids: string[];
  name: string;
  char: string;
  admin: boolean;
  img: string | null;
};

function player(
  ids: string[],
  name: string,
  char: string,
  admin: boolean,
  cls: P2EClass,
): Player {
  return {
    ids,
    name,
    char,
    admin,
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
    'dm',
  ),
  player(
    ['712150290169593856', '753011285003730955'],
    'jorge',
    "War'Tok Nomi",
    false,
    'cleric',
  ),
  player(['555850241912602631'], 'mike', 'Crisco Wilford', false, 'wizard'),
  player(['652106046571020299'], 'noah', 'Theodore', false, 'champion'),
  player(['417896818844893194'], 'tanner', 'Tanner', false, 'fighter'),
  player(['718654848022609982'], 'sam', 'Sam', false, 'rogue'),
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
