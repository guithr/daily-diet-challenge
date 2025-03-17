import { usersRoutes } from './routes/users.routes'
import { mealsRoutes } from './routes/meals_routes'
import cookie from '@fastify/cookie'
import fastify from 'fastify'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})
app.register(mealsRoutes, {
  prefix: 'meals',
})
