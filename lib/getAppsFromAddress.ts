import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import {decodeGlobalState} from './decodeGlobalState'
const algodConfig = getAlgodConfigFromEnvironment()
const algorand = AlgorandClient.fromConfig({ algodConfig })

export const getAllAppsFromAddress = async (Address: string) => {
    const accountInfo = await algorand.client.algod.accountInformation(Address).do();
    return accountInfo['createdApps'] || [];

}

export const getAppsFromAddressByKey = async (Address: string, keyValue: { key: string, value: string }) => {
    const addresses = Address.split(",");
    const allFilteredApps = [];

    for (const addr of addresses) {
        const accountInfo = await algorand.client.algod.accountInformation(addr.trim()).do();
        const allApps = accountInfo['createdApps'];

        let filtered = (allApps || []).filter(app => {
            const globalState = app.params.globalState;
            //return globalState ? decodeGlobalState(globalState as any).decodedStates.some(state => state.key === keyValue.key) : false; //all contracts with key v
            // filter by version
            return globalState ? decodeGlobalState(globalState as any).decodedStates.some(state => state.key === keyValue.key && state.value.toString().split('v')[1] === keyValue.value.split('v')[1]) : false;
        });

        console.log(filtered)
        
        
        allFilteredApps.push(...filtered);
    }

    return allFilteredApps;
}

