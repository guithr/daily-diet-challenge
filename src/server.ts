import { usersRoutes } from './routes/users.routes'
import fastify from 'fastify'
import { env } from './env'

const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server listening on port')
  })
