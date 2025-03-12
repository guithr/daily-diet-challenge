import fastify from 'fastify'
import crypto from 'node:crypto'
import { knex } from './database'

const app = fastify()

app.get('/users', async () => {
  const user = await knex('users').insert({
    id: crypto.randomUUID(),
    name: 'Guilherme Matos',
    email: 'guilherme.thrmatos@gmail.com',
    session_id: 'teste',
  })

  return user
})

app
  .listen({
    port: 3000,
  })
  .then(() => {
    console.log('Server listening on port')
  })
