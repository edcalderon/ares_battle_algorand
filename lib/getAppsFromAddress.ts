import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import {decodeGlobalState} from './decodeGlobalState'
const algodConfig = getAlgodConfigFromEnvironment()
const algorand = AlgorandClient.fromConfig({ algodConfig })

export const getAllAppsFromAddress = async (Address: string) => {
    const accountInfo = await algorand.client.algod.accountInformation(Address).do();
    return accountInfo['createdApps'] || [];

}

export const getAppsFromAddressByKey = async (Address: string, keyValue: { key: string, value: any }) => {
    const accountInfo = await algorand.client.algod.accountInformation(Address).do();
    const allApps = accountInfo['createdApps']

    const filtered = (allApps || []).filter(app => {
        const globalState = app.params.globalState;
        return globalState ? decodeGlobalState(globalState as any).decodedStates.some(state => state.key === keyValue.key) : false;
    });
    return filtered;
}

