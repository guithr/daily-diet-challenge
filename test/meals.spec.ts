import { app } from '../src/app' // Importa a instância do aplicativo Fastify.
import { execSync } from 'child_process' // Permite executar comandos do sistema de forma síncrona.
import request from 'supertest' // Biblioteca para realizar requisições HTTP em testes.
import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest' // Importa funções do Vitest.

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all') // Remove todas as migrations
    execSync('npm run knex -- migrate:latest') // Reaplica todas as migrations
  })

  // Deve ser possível registrar uma refeição feita
  it('To create a new meal, a user must be created first', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Guilherme Oliveira', email: 'goliveira@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Filé de Frango Grelhado',
        description: 'Filé de Frango Grelhado e Salada mista ',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  // Deve ser possível listar todas as refeições de um usuário
  it('should be able to list all meals from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Guilherme Oliveira', email: 'goliveira@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Torta de limão',
        description: 'Torta de limão',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Panqueca de frango',
        description: 'Panqueca de frango',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)

    // This validate if the order is correct
    expect(mealsResponse.body.meals[0].name).toBe('Panqueca de frango')
    expect(mealsResponse.body.meals[1].name).toBe('Torta de limão')
  })

  // Deve ser possível visualizar uma única refeição
  it('should be able to show a single meal', async () => {
    // First we have to create a user
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Guilherme Oliveira', email: 'goliveira@gmail.com' })
      .expect(201)

    // Then we have to create some meals
    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Torta de limão',
        description: 'Torta de limão',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Filé de frango grelhado',
        description: 'Filé de frango grelhado',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    // Here we have to list all meals to get the id of the first meal
    const allMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .expect(200)

    // Here we have to get the id of the first meal
    const mealId = allMealsResponse.body.meals[0].id

    // Here we have to get the first meal
    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .expect(200)

    //  Here we have to validate the response
    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Filé de frango grelhado',
        description: 'Filé de frango grelhado',
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    })
  })

  // Deve ser possível editar uma refeição, podendo alterar todos os dados
  it.only('should be able to update a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Guilherme Oliveira', email: 'guilherme.matos@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Torta de limão',
        description: 'Torta de limão',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    const allMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .expect(200)

    const mealId = allMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .send({
        name: 'Filé de frango grelhado',
        description: 'Filé de frango grelhado',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)

    // Meal updated
    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie')?.[0] || '')
      .expect(200)
  })
})
