import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkIfSessionIdExist(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return response.status(404).send({ error: 'Unauthorized' })
  }
}
