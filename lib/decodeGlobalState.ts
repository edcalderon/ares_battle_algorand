import algosdk from 'algosdk';

export const decodeGlobalState = (globalState: Array<{ key: string; value: any }>) => {
    const decodedStates = Array.from(globalState).map((item) => {
        const decodedKey = Buffer.from(item.key, "base64").toString();
        let decodedValue;

        decodedValue = typeof item.value === 'string'
            ? Buffer.from(item.value, "base64").toString()
            : (item.value.bytes ? Buffer.from(item.value.bytes, "base64").toString() : 'Invalid value');

        if (decodedKey === "g" && typeof item.value === 'object' && item.value.bytes) {
            decodedValue = algosdk.encodeAddress(new Uint8Array(Buffer.from(item.value.bytes, "base64")));
        }

        if (decodedKey === "hp") {
            decodedValue = parseInt(item.value.uint)
        }

        return { key: decodedKey, value: decodedValue };
    });

    return { decodedStates };
};