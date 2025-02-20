import algosdk from 'algosdk';

export const decodeGlobalState = (globalState: Array<{ key: any; value: any }>) => {
    const decodedStates = Array.from(globalState).map((item) => {
        
        let decodedKey : any = Buffer.from(item.key, "base64").toString();
        let decodedValue: any;

        decodedValue = typeof item.value === 'string'
            ? Buffer.from(item.value, "base64").toString()
            : (item.value.bytes ? Buffer.from(item.value.bytes, "base64").toString() : 'Invalid value');

        if (['g', 't1', 't2', 't3'].includes(decodedKey) && typeof item.value === 'object' && item.value.bytes) {
            decodedValue = algosdk.encodeAddress(new Uint8Array(Buffer.from(item.value.bytes, "base64")));
        }

        if (item.value.uint) {
            decodedValue = parseInt(item.value.uint)
        }

        return { key: decodedKey, value: decodedValue };
    });

    return { decodedStates };
};