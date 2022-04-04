import { DataTypes, Model, ModelCtor } from 'sequelize';
import { Sequelize } from 'sequelize/types/sequelize';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaModel = ModelCtor<Model<any, any>>;

export type Schema = {
  insight: SchemaModel;
  rolls: SchemaModel;
};

export function setSchema(sql: Sequelize): Schema {
  const insight = sql.define(
    'insight',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      quantity: DataTypes.INTEGER,
    },
    {
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
    },
  );

  const rolls = sql.define(
    'roll',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      value: DataTypes.INTEGER,
      base: DataTypes.INTEGER,
      player: DataTypes.STRING,
    },
    {
      timestamps: true,
      updatedAt: false,
    },
  );

  return { insight, rolls };
}

export async function addInsight({ insight }: Schema, quantity: number) {
  await insight.build({ quantity }).save();
}

export async function totalInsight({ insight }: Schema): Promise<number> {
  return await insight.sum('quantity');
}

export async function recordRoll(
  { rolls }: Schema,
  player: string,
  roll: { value: number; base: number },
) {
  await rolls.build({ ...roll, player }).save();
}

export async function getRolls({
  rolls,
}: Schema): Promise<
  { value: number; base: number; player: string; time: Date }[]
> {
  return (await rolls.findAll()).map((model: any) => ({
    value: model.value,
    base: model.base,
    player: model.player,
    time: model.createdAt,
  }));
}
