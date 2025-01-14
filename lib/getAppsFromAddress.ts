import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { decodeGlobalState } from './decodeGlobalState'
import { Contributor } from '@/types'
import algosdk from 'algosdk'
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

        if (!appInfo) return null; // Return null if appInfo is not found

        const decodedState = decodeGlobalState(appInfo.params.globalState as any).decodedStates;

        const contributors = decodedState && decodedState.length > 0
            ? decodedState.find(state => state.key === 'numStakers')?.value
            : 'Unknown'
        return contributors

    } catch (error) {
        console.error("Error fetching app global state:", error);
        return null;
    }
};


export const getAppBoxToBossFormat = async (appId: bigint, name: Uint8Array): Promise<any> => {
    try {
        const boxesResponse = await algorand.client.algod.getApplicationBoxByName(appId, name).do();

        const numStakers = await getAppGlobalStateContributorsToBossFormat(appId)
    
        // Define the empty box matrix
        const emptyBoxMatrix = new Uint8Array([...Array(1280)].map(() => 0x41)); // 1280 bytes of 'A'

        const CompareEmptyBoxMatrix = Buffer.from(emptyBoxMatrix).toString('utf-8')
        const CompareResponseBoxMatrix =  Buffer.from(boxesResponse.value).toString('base64')

        // Compare response to the empty box matrix
        if (boxesResponse.value && CompareEmptyBoxMatrix != CompareResponseBoxMatrix) {

            const formattedDataArray = [];
            for (let i = 0; i < numStakers; i++) {
                const offset = i * 48; // Assuming each item takes 48 bytes (32 for address, 8 for balance, 8 for entryRound)
                const address = algosdk.encodeAddress(boxesResponse.value.slice(offset, offset + 32));
                const contribution = algosdk.decodeUint64(boxesResponse.value.slice(offset + 32, offset + 40), 'bigint');
                const entryRound = algosdk.decodeUint64(boxesResponse.value.slice(offset + 40, offset + 48), 'bigint');

                formattedDataArray.push({ address, contribution: parseInt(contribution.toString()), entryRound });
            }
            return formattedDataArray; 
        }

        return null; // Return null if the box is empty

    } catch (error) {
        console.error("Error fetching app:", error);
        return null; 
    }
};


