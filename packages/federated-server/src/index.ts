import Fastify, { FastifyRequest } from 'fastify'
import mercurius, { MercuriusCommonOptions } from 'mercurius'
import { BuildSchemaOptions } from 'type-graphql'
import jwt from 'jsonwebtoken'
import * as joiful from 'joiful'
import { ObjectId } from 'mongodb'

import buildFederatedSchema from '@pkg/federated-schema'
import { secrets, Vault } from '@pkg/vault'
import { TypegooseMiddleware } from '@pkg/middleware'
import { ObjectIdScalar } from '@pkg/scalar'

type ServerOptions = {
  port: string | number
  healthEndpoint?: string
}

async function decodeJWT({
  jwtSecret,
  bearer,
}: {
  jwtSecret: string
  bearer: string
}) {
  if (!bearer) return null
  const token = bearer.split(' ')
  try {
    const decoded = jwt.verify(token[1], jwtSecret)
    return decoded
  } catch (error) {
    throw new Error('JWT cannot be decrypted.')
  }
}

export interface FederationServerOptions {
  schemaOpts: BuildSchemaOptions
  adapterOpts: MercuriusCommonOptions
  serverOpts: ServerOptions
}

export const bootstrapFederatedServer = async ({
  schemaOpts,
  adapterOpts,
  serverOpts,
}: FederationServerOptions) => {
  let result

  try {
    const vault: Vault = await secrets()
    const fastify = Fastify()
    const schema = await buildFederatedSchema({
      ...schemaOpts,
      globalMiddlewares: [TypegooseMiddleware],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      validate: (argValue: any) => {
        const { error } = joiful.validate(argValue)
        if (error) {
          throw error
        }
      },
    })
    const composedServerOptions = {
      ...schema,
      context: async (request: FastifyRequest) => {
        const user = await decodeJWT({
          jwtSecret: vault.JWT_SECRET,
          bearer: request.headers.authorization || '',
        })

        return {
          ...request,
          user,
        }
      },
      federationMetadata: true,
      ...adapterOpts,
      path: '/',
    }
    await fastify.register(mercurius, composedServerOptions)
    fastify.get(serverOpts.healthEndpoint || '/health', async () => {
      return {}
    })

    result = await fastify.listen(serverOpts.port)
  } catch (err) {
    throw new Error(err)
  }

  return result
}
