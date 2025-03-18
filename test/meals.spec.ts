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
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

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
})
