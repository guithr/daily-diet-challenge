import fastify from 'fastify'

const app = fastify()

app.get('/test', () => {
  return { message: 'Hello, Fastify!' }
})

app
  .listen({
    port: 3000,
  })
  .then(() => {
    console.log('Server listening on port')
  })
