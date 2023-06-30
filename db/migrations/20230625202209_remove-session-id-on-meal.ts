import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.dropColumn("session_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.uuid("session_id").references("id").inTable("usermeal");
  });
}