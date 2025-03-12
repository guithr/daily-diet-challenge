import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import knex from 'knex'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
      email: z.string().email('E-mail inválido'),
    })

    const { email, name } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
    })

    return response.status(201).send()
  })
}
