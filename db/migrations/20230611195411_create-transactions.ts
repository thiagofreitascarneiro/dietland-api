import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meal', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.boolean('isInDiet').defaultTo(true).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meal');
}

