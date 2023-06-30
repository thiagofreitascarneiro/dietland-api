import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.date('meal_date').nullable();
    table.time('meal_time').nullable();
  });

  // Atualizar os registros existentes com os valores desejados para as novas colunas
  await knex('meal').update({
    meal_date: '2023-06-25',
    meal_time: '22:30'
  });
  
  // Alterar as colunas para NOT NULL depois de atualizar os registros
  await knex.schema.alterTable("meal", (table) => {
    table.date('meal_date').notNullable().alter();
    table.time('meal_time').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.dropColumn('meal_date');
    table.dropColumn('meal_time');
  });
}