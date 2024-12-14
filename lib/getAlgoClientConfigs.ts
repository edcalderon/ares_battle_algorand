import { AlgoClientConfigI, AlgoKMDConfig } from '../interfaces/network'
import { NODE_NETWORK, NODE_PORT, NODE_TOKEN, NODE_URL } from '../config/env'

export function getAlgodConfigFromEnvironment(): AlgoClientConfigI {
  if (!NODE_URL) {
    throw new Error('Attempt to get default algod configuration without specifying NODE_URL in the environment variables')
  }

  return {
    server: NODE_URL,
    port: NODE_PORT,
    token: NODE_TOKEN,
    network: NODE_NETWORK,
  }
}
