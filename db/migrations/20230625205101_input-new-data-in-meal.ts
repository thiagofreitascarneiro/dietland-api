import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.timestamp('meal_datetime').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.dropColumn('meal_datetime');
  });
}