import { checkIfSessionIdExist } from '../middlewares/check-if-session-id-exists'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkIfSessionIdExist] },
    async (request, response) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(), // converte valores que não são Date para Date
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
        user_id: request.user?.id,
      })
      return response.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkIfSessionIdExist],
    },
    async (request, response) => {
      const meals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('date', 'desc')
      return response.send({ meals })
    },
  )

  app.get(
    '/:mealId',
    { preHandler: [checkIfSessionIdExist] },
    async (request, response) => {
      const mealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = mealsParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      return response.send({ meal })
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkIfSessionIdExist] },
    async (request, response) => {
      const mealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = mealsParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
        request.body,
      )

      await knex('meals').where({ id: mealId }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
      })

      return response.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkIfSessionIdExist] },
    async (request, response) => {
      const mealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = mealParamsSchema.parse(request.params)

      await knex('meals').where({ id: mealId }).delete()

      return response.status(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkIfSessionIdExist],
    },
    async (request, response) => {
      const totalMealsOnDiet = await knex('meals')
        .where({
          user_id: request.user?.id,
          is_on_diet: true,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where({
          user_id: request.user?.id,
          is_on_diet: false,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMeals = await knex('meals')
        .where({
          user_id: request.user?.id,
        })
        .orderBy('date', 'desc')

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return response.status(200).send({
        totalMeals: totalMeals.length,
        totalMealsOffDiet,
        totalMealsOnDiet,
        bestOnDietSequence,
      })
    },
  )
}
