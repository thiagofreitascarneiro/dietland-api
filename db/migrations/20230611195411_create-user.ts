import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('usermeal', (table) => {
        table.uuid('id').primary();
        table.string('user').notNullable();
        table.string('email').notNullable();
    })
   
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('usermeal');
}

