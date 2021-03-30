import 'reflect-metadata'

import { bootstrapFederatedServer } from '@pkg/federated-server'

import pkg from '../package.json'
import Resolver from './resolver'

const bootstrap = async () => {
  try {
    const result = await bootstrapFederatedServer({
      schemaOpts: {
        resolvers: [Resolver],
      },
      adapterOpts: {
        graphiql: 'playground',
      },
      serverOpts: {
        port: 4002,
      },
    })

    console.log(`${pkg.name}@${pkg.version} - ${result}`)
  } catch (e) {
    console.error(e)
  }
}

bootstrap()
