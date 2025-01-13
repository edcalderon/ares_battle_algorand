import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'
const algodConfig = getAlgodConfigFromEnvironment()
import type { ExplorerActionType } from '@/types';

export const getExplorerUrl = (id: string, action: ExplorerActionType) => {

    return  algodConfig.network === 'TestNet'
    ? `https://lora.algokit.io/testnet/${action}/` + id
    : `https://lora.algokit.io/mainnet/${action}/` + id;
}

export const getAlgorandApiUrl = (id: string, action: ExplorerActionType) => {
    return  algodConfig.network === 'TestNet'
    ? `https://testnet-api.algonode.cloud/v2/${action}/` + id
    : `https://mainnet-api.algonode.cloud/v2/${action}/` + id;
}