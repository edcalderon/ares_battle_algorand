'use client'
import React from 'react'
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import algosdk from 'algosdk';
import { allCollection } from 'greek-mythology-data';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'

export const BossCard = ({ item }: any) => {
    const [gods, setGods] = React.useState<any[]>([]);
    const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const genRanRgb = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
    const img = `https://www.thecolorapi.com/id?format=svg&named=false&hex=${genRanHex(6)}` //faker.image.avatarGitHub()
    const router = useRouter()
    const locale = useLocale();
    const algodConfig = getAlgodConfigFromEnvironment()

    React.useEffect(() => {
        const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
        console.log(filteredData)
        setGods(filteredData)
        console.log(item)
    }, [allCollection]);

    const decodeGlobalState = (globalState: { key: string; value: { bytes?: string } | string }[]) => {
        const decodedStates = Array.from(globalState).map((item) => {
            const decodedKey = Buffer.from(item.key, "base64").toString();
            let decodedValue;

            if (decodedKey === "g" && typeof item.value === 'object' && item.value.bytes) {
                decodedValue = algosdk.encodeAddress(new Uint8Array(Buffer.from(item.value.bytes, "base64")));
            } else if (decodedKey === "hp") {
                if (typeof item.value === 'string') {
                    decodedValue = parseInt(Buffer.from(item.value, "base64").toString(), 10);
                } else if (item.value.bytes) {
                    decodedValue = parseInt(Buffer.from(item.value.bytes, "base64").toString(), 10);
                } else {
                    decodedValue = 'Invalid value for key "hp"';
                }
            } else if (decodedKey === "n") {
                if (typeof item.value === 'object' && item.value.bytes) {
                    decodedValue = Buffer.from(item.value.bytes, "base64").toString();
                } else {
                    decodedValue = 'Invalid value for key "n"';
                }
            } else {
                decodedValue = typeof item.value === 'string'
                    ? Buffer.from(item.value, "base64").toString()
                    : (item.value.bytes ? Buffer.from(item.value.bytes, "base64").toString() : 'Invalid value');
            }

            return { key: decodedKey, value: decodedValue };
        });

        const nValue = decodedStates.find(state => state.key === 'n')?.value || 'Key "n" not found';
        return { nValue, decodedStates };
    };

    const { nValue } = decodeGlobalState(item.params.globalState);
    const { decodedStates } = decodeGlobalState(item.params.globalState);
    console.log(decodedStates)

    // Ensure nValue is a string before removing special characters
    const cleanNValue = String(nValue).replace(/[^a-zA-Z0-9]/g, '');
    const explorerBaseUrl = algodConfig.network === 'TestNet'
        ? 'https://lora.algokit.io/testnet/application/'
        : 'https://lora.algokit.io/mainnet/application/';

    if (nValue !== 'Key "n" not found') {
        const godImage = gods.find(god => god.name === cleanNValue)?.images?.regular;
        return (
            <Card shadow="sm" key={item.id} isPressable onPress={() => router.push(`/${locale}/boss/${item.id}`)}>
                <CardBody className="overflow-visible p-0">
                    <Image
                        shadow="sm"
                        radius="lg"
                        width="100%"
                        alt={item.id}
                        className="w-full object-cover h-[140px]"
                        src={godImage || img}
                    />
                    <p>{cleanNValue}</p>
                </CardBody>
                <CardFooter className="text-small justify-between">
                   
                    <p className="text-default-500">
                        <a href={`${explorerBaseUrl}${item.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                            {item.id.toString()}
                        </a>
                    </p>
                </CardFooter>
            </Card>
        )
    } 

    return null;
}
