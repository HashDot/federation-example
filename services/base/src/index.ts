import 'reflect-metadata'

import Meta from './entities/Meta'

import pkg from '../package.json'
import Resolver from './resolver'
import { bootstrapFederatedServer } from '@pkg/federated-server'
import { FastifyRequest } from 'fastify'
export type ServiceContext = FastifyRequest

const bootstrap = async () => {
  try {
    const result = await bootstrapFederatedServer({
      schemaOpts: {
        resolvers: [Resolver],
        orphanedTypes: [Meta],
      },
      adapterOpts: {
        graphiql: 'playground',
        subscription: {
          onConnect: (data) => {
            console.log('on connect', data)
            return {
              hi: 'hi',
            }
          },
          onDisconnect: () => {
            console.log('on disconnect')
          },
        },
      },
      serverOpts: {
        port: 4001,
      },
    })

    console.log(`${pkg.name}@${pkg.version} - ${result}`)
  } catch (e) {
    console.error(e)
  }
}

bootstrap()
