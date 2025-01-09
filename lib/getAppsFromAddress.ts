import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { decodeGlobalState } from './decodeGlobalState'
import { Contributor, Boss } from '@/types'
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

        let filtered = (allApps || []).filter((app: any) => {
            const globalState = app.params.globalState;
            //return globalState ? decodeGlobalState(globalState as any).decodedStates.some(state => state.key === keyValue.key) : false; //all contracts with key v
            // filter by version
            return globalState ? decodeGlobalState(globalState as any).decodedStates.some(state => state.key === keyValue.key && state.value.toString().split('v')[1] === keyValue.value.split('v')[1]) : false;
        });

        allFilteredApps.push(...filtered);
    }
    return allFilteredApps;
}

export const getAppInfo = async (appId: bigint) => {
    const appInfo = await algorand.client.algod.getApplicationByID(appId).do();
    return appInfo;
}

export const getAppGlobalStateContributorsToBossFormat = async (appId: bigint): Promise<any> => {
    try {
        const appInfo = await algorand.client.algod.getApplicationByID(appId).do();
        console.log("API Response:", appInfo); // Log the response
        if (!appInfo) return null; // Return null if appInfo is not found

        const decodedState = decodeGlobalState(appInfo.params.globalState as any).decodedStates;

        const contributors = decodedState ? decodedState
        .filter(state => !['n', 'h', 'th', 'g', 's', 'p', 'v'].includes(state.key))
        .map(state => ({ address: state.key, contribution: state.value })) as Contributor[] : [];
        return contributors

    } catch (error) {
        console.error("Error fetching app global state:", error);
        return null; // Return null or handle the error as needed
    }
};