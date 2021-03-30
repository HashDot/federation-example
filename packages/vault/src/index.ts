var options = {
  apiVersion: 'v1',
  endpoint: process.env.VAULT_HOST || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || 'root',
}

const vault = require('node-vault')(options)

export const secrets = async (): Promise<Vault> => {
  try {
    const result = await vault.read(`/secret/data/${process.env.NODE_ENV}`)
    return result?.data?.data
  } catch (error) {
    throw new Error(error)
  }
}

export default vault

export type SERVICE = {
  mandatory: boolean
  name: string
  url: string
}

export type Vault = {
  JWT_SECRET: string
  SERVICES: SERVICE[]
}
