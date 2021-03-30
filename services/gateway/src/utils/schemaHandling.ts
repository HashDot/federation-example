import { print } from 'graphql'
import { MercuriusGatewayService } from 'mercurius'
import { introspectSchema } from '@graphql-tools/wrap'
import { AsyncExecutor } from '@graphql-tools/delegate'
import fetch from 'isomorphic-fetch'

import { secrets, Vault } from '@pkg/vault'

interface ExecutorData {
  document: any
  variables: any
  context?: any
}

const makeExecutor = async (url: string) => {
  return async ({ document, variables }: ExecutorData) => {
    const query = print(document)
    // console.log(query)

    let result

    try {
      result = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })
    } catch (error) {
      throw new Error(error)
    }

    return result.json()
  }
}

const checkSchemaIntrospection = (
  executor: AsyncExecutor,
  service: MercuriusGatewayService,
): Promise<void> => {
  return new Promise((resolve) => {
    introspectSchema(executor)
      .then(() => {
        console.info(`Graphql successfully introspected from ${service.name}`)
        resolve()
      })
      .catch((error) => {
        console.log(error)

        console.error(
          `Failed initial schema introspection from ${service.name}`,
        )
        setTimeout(
          () =>
            resolve(
              checkSchemaIntrospection(executor as AsyncExecutor, service),
            ),
          2000,
        )
      })
  })
}

export const introspectFederatedSchemas = async () => {
  const vault: Vault = await secrets()
  return await Promise.all(
    vault.SERVICES.map(async (service: MercuriusGatewayService) => {
      const executor = await makeExecutor(service.url)

      try {
        await checkSchemaIntrospection(executor as AsyncExecutor, service)
      } catch (error) {
        throw new Error(`Unable to fetch schema ${error}`)
      }

      return
    }),
  )
}
