import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import knex from 'knex'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/users', async () => {
    const user = await knex('users').insert({
      id: crypto.randomUUID(),
      name: 'Guilherme Matos',
      email: 'guilherme.thrmatos@gmail.com',
      session_id: 'teste',
    })

    return user
  })
}
