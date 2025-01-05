import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
const algodConfig = getAlgodConfigFromEnvironment()
import type { ExplorerActionType } from '@/types';

export const getExplorerUrl = (id: string, action: ExplorerActionType) => {

    return  algodConfig.network === 'TestNet'
    ? `https://lora.algokit.io/testnet/${action}/` + id
    : `https://lora.algokit.io/mainnet/${action}/` + id;
}