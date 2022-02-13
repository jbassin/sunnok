import { DataTypes, Model, ModelCtor } from 'sequelize';
import { Sequelize } from 'sequelize/types/sequelize';

export type Schema = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insight: ModelCtor<Model<any, any>>;
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

  return { insight };
}

export async function addInsight({ insight }: Schema, quantity: number) {
  await insight.build({ quantity }).save();
}

export async function totalInsight({ insight }: Schema): Promise<number> {
  return await insight.sum('quantity');
}
