import { app } from '../src/app' // Importa a instância do aplicativo Fastify.
import { execSync } from 'child_process' // Permite executar comandos do sistema de forma síncrona.
import request from 'supertest' // Biblioteca para realizar requisições HTTP em testes.
import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest' // Importa funções do Vitest.

describe('Users routes', () => {
  // Antes de todos os testes, inicia o servidor do Fastify
  beforeAll(async () => {
    await app.ready()
  })

  // Após todos os testes, fecha o servidor do Fastify
  afterAll(async () => {
    await app.close()
  })

  // Antes de cada teste, reseta o banco de dados para garantir um ambiente limpo
  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all') // Remove todas as migrations
    execSync('npm run knex -- migrate:latest') // Reaplica todas as migrations
  })

  it('should be able to create a new user', async () => {
    // Faz uma requisição para criar um novo usuário na API
    const response = await request(app.server)
      .post('/users') // Envia um POST para a rota de criação de usuários
      .send({ name: 'Guilherme Matos', email: 'gmatos@gmail.com' }) // Envia o payload no corpo da requisição
      .expect(201) // Espera que a resposta tenha o status HTTP 201 (Created)

    // Captura os cookies retornados na resposta
    const cookies = response.get('Set-Cookie')

    // Verifica se nos cookies existe um valor que contém "sessionId",
    // indicando que a sessão do usuário foi criada corretamente
    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })
})
