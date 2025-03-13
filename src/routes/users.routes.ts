import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('E-mail inválido'),
      sessionId: z.string(),
    })

    const { email, name, sessionId } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return response.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select()
    return { users }
  })

  app.get('/:id', async (request) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getUserParamsSchema.parse(request.params)

    const user = await knex('users').where('id', id).first()

    return { user }
  })
}
