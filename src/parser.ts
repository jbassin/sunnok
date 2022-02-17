import { randomInt } from 'crypto';

type Token =
  | { kind: 'qDice'; contents: string }
  | { kind: 'pDice'; contents: string }
  | { kind: 'atom'; contents: string }
  | { kind: 'op'; contents: string }
  | { kind: 'whitespace'; contents: string }
  | { kind: 'eof' };

type LexerRule = {
  target: RegExp;
  toToken: (token: string) => Token;
};

const lexerRules: LexerRule[] = [
  {
    target: /[\s]+/,
    toToken: (contents) => ({ kind: 'whitespace', contents }),
  },
  {
    target: /\d+[d]\d+/,
    toToken: (contents) => ({ kind: 'qDice', contents }),
  },
  {
    target: /[d]\d+/,
    toToken: (contents) => ({ kind: 'pDice', contents }),
  },
  {
    target: /\+|\-|\*|\/|\(|\)|adv|dis/,
    toToken: (contents) => ({ kind: 'op', contents }),
  },
  {
    target: /[\w]+[\w\d]*/,
    toToken: (contents) => ({ kind: 'atom', contents }),
  },
];

class Lexer {
  tokens: Token[];

  constructor(input: string) {
    this.tokens = [];

    let mutInput = input.toLocaleLowerCase();
    lexer: while (true) {
      if (mutInput.length === 0) {
        this.tokens.push({ kind: 'eof' });
        break lexer;
      }

      for (const { target, toToken } of lexerRules) {
        const re = new RegExp(`^(${target.source})`, target.flags);

        if (re.test(mutInput)) {
          const match = re.exec(mutInput)[1];
          mutInput = mutInput.slice(match.length);
          this.tokens.push(toToken(match));
          continue lexer;
        }
      }

      throw `Can't lex supplied input: ${mutInput}`;
    }

    this.tokens = this.tokens.filter(({ kind }) => kind !== 'whitespace');
  }

  next() {
    return this.tokens.shift();
  }

  peek() {
    return this.tokens[0];
  }
}

type Expr =
  | { kind: 'die'; quantity: number; base: number }
  | { kind: 'adv' | 'dis'; expr: Expr }
  | { kind: 'num'; value: number }
  | { kind: 'op'; op: '+' | '-' | '*' | '/'; lhs: Expr; rhs: Expr };

function expr(input: string) {
  const lexer = new Lexer(input);
  return expr_bp(lexer, 0);
}

function expr_bp(lexer: Lexer, min_bp: number): Expr {
  let lhs = ((): Expr => {
    const token = lexer.next();
    switch (token.kind) {
      case 'atom': {
        const value = parseInt(token.contents, 10);
        if (isNaN(value)) throw `Bad number: ${token}`;
        return { kind: 'num', value };
      }
      case 'qDice': {
        const [q, b] = token.contents.split('d');
        const quantity = parseInt(q, 10);
        const base = parseInt(b, 10);
        if (isNaN(quantity) || isNaN(base)) throw `Bad number: ${token}`;
        return { kind: 'die', quantity, base };
      }
      case 'pDice': {
        const [_, b] = token.contents.split('d');
        const base = parseInt(b, 10);
        if (isNaN(base)) throw `Bad number: ${token}`;
        return { kind: 'die', quantity: 1, base };
      }
      case 'op': {
        if (token.contents !== '(') {
          throw `unexpected operator: ${JSON.stringify(token)}`;
        }

        const lhs = expr_bp(lexer, 0);
        lexer.next();
        return lhs;
      }
      default:
        throw `bad token: ${JSON.stringify(token)}`;
    }
  })();

  loop: while (true) {
    const op = (() => {
      const token = lexer.peek();
      switch (token.kind) {
        case 'eof':
          return null;
        case 'op':
          return token.contents;
        default:
          throw `bad token: ${token}`;
      }
    })();

    if (op === null) break loop;

    const postfix_bp = postfix_binding_power(op);
    postfix: if (postfix_bp) {
      if (postfix_bp < min_bp) break postfix;
      lexer.next();

      lhs = { kind: op as 'adv' | 'dis', expr: lhs };
      continue loop;
    }

    const bp = infix_binding_power(op);
    if (bp === null) break loop;
    const [l_bp, r_bp] = bp;

    if (l_bp < min_bp) break loop;
    lexer.next();
    const rhs = expr_bp(lexer, r_bp);

    lhs = { kind: 'op', op: op as '+' | '-' | '*' | '/', lhs, rhs };
  }

  return lhs;
}

function postfix_binding_power(op: string) {
  switch (op) {
    case 'adv':
    case 'dis':
      return 1;
    default:
      return null;
  }
}

function infix_binding_power(op: string) {
  switch (op) {
    case '+':
    case '-':
      return [2, 3];
    case '*':
    case '/':
      return [4, 5];
    default:
      return null;
  }
}

function normalize_postfix(expr: Expr, kind: 'adv' | 'dis') {
  switch (expr.kind) {
    case 'adv':
    case 'dis': {
      if (kind === expr.kind) return normalize_postfix(expr.expr, kind);
      return traverse_postfix(expr.expr);
    }
    case 'num':
      return expr;
    case 'die': {
      if (expr.quantity > 2 || expr.base !== 20) return expr;
      return { kind, expr: { kind: 'die', quantity: 1, base: 20 } };
    }
    case 'op':
      return {
        kind: 'op',
        op: expr.op,
        lhs: normalize_postfix(expr.lhs, kind),
        rhs: normalize_postfix(expr.rhs, kind),
      };
  }
}

function traverse_postfix(expr: Expr) {
  switch (expr.kind) {
    case 'adv':
    case 'dis':
      return normalize_postfix(expr, expr.kind);
    case 'num':
    case 'die':
      return expr;
    case 'op':
      return {
        kind: 'op',
        op: expr.op,
        lhs: traverse_postfix(expr.lhs),
        rhs: traverse_postfix(expr.rhs),
      };
  }
}

function parse(input: string) {
  const parsed = expr(input);
  return traverse_postfix(parsed);
}

type Solved =
  | {
      kind: 'atom';
      repr: string;
      value: number;
      values: { value: number; base: number }[];
      min: number;
      max: number;
    }
  | { kind: 'op'; repr: string };

function solve(expr: Expr): Solved[] {
  switch (expr.kind) {
    case 'num':
      return [
        {
          kind: 'atom',
          repr: expr.value.toString(),
          value: expr.value,
          values: [],
          min: expr.value,
          max: expr.value,
        },
      ];
    case 'op':
      return [
        solve(expr.lhs),
        { kind: 'op' as 'op', repr: expr.op },
        solve(expr.rhs),
      ].flat();
    case 'die': {
      if (expr.quantity === 1) {
        const value = randomInt(expr.base) + 1;
        return [
          {
            kind: 'atom',
            repr: `1d${expr.base} (${value})`,
            value,
            values: [{ value, base: expr.base }],
            min: 1,
            max: expr.base,
          },
        ];
      }

      const values = Array.from(
        { length: expr.quantity },
        (_) => randomInt(expr.base) + 1,
      );
      return [
        {
          kind: 'atom',
          repr: `${expr.quantity}d${expr.base} (${values.join(',')})`,
          value: values.reduce((lhs, rhs) => lhs + rhs),
          values: values.map((value) => ({ value, base: expr.base })),
          min: expr.quantity,
          max: expr.quantity * expr.base,
        },
      ];
    }
    case 'adv': {
      const lhs = randomInt(20) + 1;
      const rhs = randomInt(20) + 1;

      return [
        {
          kind: 'atom',
          repr: `1d20 [${lhs},${rhs}]`,
          value: Math.max(lhs, rhs),
          values: [
            { value: lhs, base: 20 },
            { value: rhs, base: 20 },
          ],
          min: 1,
          max: 20,
        },
      ];
    }
    case 'dis': {
      const lhs = randomInt(20) + 1;
      const rhs = randomInt(20) + 1;

      return [
        {
          kind: 'atom',
          repr: `1d20 [${lhs},${rhs}]`,
          value: Math.min(lhs, rhs),
          values: [
            { value: lhs, base: 20 },
            { value: rhs, base: 20 },
          ],
          min: 1,
          max: 20,
        },
      ];
    }
  }
}

export type Rolled = {
  repr: string;
  value: number;
  rolls: { value: number; base: number }[];
  goodness: 'fumble' | 'bad' | 'okay' | 'good' | 'crit';
};

export function roll(input: string): Rolled | null {
  try {
    const tree = parse(input);
    const solved = solve(tree);

    const roll = solved.reduce(
      (acc, con) => {
        switch (con.kind) {
          case 'op':
            return { ...acc, repr: `${acc.repr} ${con.repr} ` };
          case 'atom':
            return {
              repr: `${acc.repr}${con.repr}`,
              value: acc.value + con.value,
              values: [...acc.values, ...con.values],
              min: acc.min + con.min,
              max: acc.max + con.max,
            };
        }
      },
      { repr: '', value: 0, values: [], min: 0, max: 0 },
    );

    const goodness = (() => {
      const avg = ((roll.value - roll.min) / (roll.max - roll.min)) * 100;
      switch (true) {
        case roll.value === roll.max:
          return 'crit';
        case roll.value === roll.min:
          return 'fumble';
        case avg >= 66:
          return 'good';
        case avg >= 33:
          return 'okay';
        default:
          return 'bad';
      }
    })();

    return { repr: roll.repr, value: roll.value, rolls: roll.values, goodness };
  } catch (error) {
    return null;
  }
}
