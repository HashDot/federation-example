import 'reflect-metadata'
import Fastify from 'fastify'
import cors from 'fastify-cors'
import mercurius, { MercuriusContext } from 'mercurius'
import { secrets, Vault, SERVICE } from '@pkg/vault'
import { introspectFederatedSchemas } from './utils/schemaHandling'
import pkg from '../package.json'

const rewriteHeaders = (headers: any) => {
  if (headers.authorization) {
    return {
      authorization: headers.authorization,
    }
  }
  return {}
}

const bootstrap = async (): Promise<void> => {
  try {
    await introspectFederatedSchemas()
  } catch (error) {
    throw new Error(error)
  }

  try {
    const vault: Vault = await secrets()
    const gateway = Fastify()

    gateway.register(require('fastify-jwt'), {
      secret: vault.JWT_SECRET,
      sign: { algorithm: 'HS256' },
    })

    await gateway.register(mercurius, {
      graphiql: 'playground',
      gateway: {
        services: vault.SERVICES.map((service: SERVICE) => ({
          ...service,
          rewriteHeaders,
        })),
        pollingInterval: 10000,
        errorHandler: (error, service) => {
          if (service.mandatory) {
            throw new Error(`Service is mandatory and not reachable ${error}`)
          } else {
            console.error(`${error}`)
          }
        },
      },
      subscription: {
        onDisconnect: (context: MercuriusContext) => {
          console.log('on disconnect', context)
        },
      },
      path: '/',
    })

    gateway.get('/health', async () => {
      return {}
    })

    gateway.register(cors, { origin: '*' })

    const result = await gateway.listen(4000)
    console.log(`${pkg.name}@${pkg.version} - ${result}`)
  } catch (error) {
    throw new Error(error)
  }
}

bootstrap().catch(console.error)
