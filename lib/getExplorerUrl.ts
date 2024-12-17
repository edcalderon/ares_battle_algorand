import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
const algodConfig = getAlgodConfigFromEnvironment()


export const getExplorerUrl = (appID: number) => {

    return  algodConfig.network === 'TestNet'
    ? 'https://lora.algokit.io/testnet/application/' + appID
    : 'https://lora.algokit.io/mainnet/application/' + appID;
}