import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('email').notNullable()
    table.string('session_id').notNullable().unique()
    table.timestamps(true, true) // Adiciona created_at e updated_at
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
