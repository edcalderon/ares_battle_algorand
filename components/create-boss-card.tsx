import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Link, Image, Button, Select, SelectItem } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { AresBattleFactory } from '@/artifacts/AresBattleClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import { AlgorandClient, microAlgos } from '@algorandfoundation/algokit-utils'
import toast from 'react-hot-toast'
import { allCollection } from 'greek-mythology-data';
import { useEffect } from 'react';
import { getExplorerUrl } from '@/lib/getAlgorandUrl';
import algosdk from 'algosdk'

export default function CreateBossCard() {
    const { activeAddress, transactionSigner } = useWalletReact()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [name, setName] = React.useState<string>('')
    const [rate, setRate] = React.useState<string>('')
    const [gods, setGods] = React.useState<any[]>([]);
    const sender = { signer: transactionSigner, addr: activeAddress! }
    const algodConfig = getAlgodConfigFromEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)
    const factory = algorand.client.getTypedAppFactory(AresBattleFactory)

    useEffect(() => {
        const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
        setGods(filteredData)
    }, [allCollection]);


    const handleCreate = async () => {
        setLoading(true)
        const bossTotalHP = parseInt(rate)
        try {

            const makePaymentTxn = async (sender: string, receiver: any, amount: number) => {
                const suggestedParams = await algorand.getSuggestedParams();
                return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    sender,
                    receiver, // Sending to self for funding
                    amount, // Amount to send
                    suggestedParams // Use fetched params
                });
            }

            const { result, appClient: client } = await factory.send.create.createApplication({
                sender: sender.addr,
                signer: sender.signer,
                args: [bossTotalHP, name],
                //deletable: true,
            });

            if (result) {
                toast.success(`${name} is been create, please fund it!`, {
                    duration: 5000
                })

                const result2 = await client.appClient.fundAppAccount({ amount: microAlgos(100000 /* 1e6 + */ /* 3100 */), sender: sender.addr.toString() })
                if (result2) {
                    toast.success(`Now Initialize ${name} Box`, {
                        duration: 5000
                    })
                    try {

                        const ptxn = await algorand.createTransaction.payment({
                            sender: sender.addr.toString(),
                            receiver: client.appAddress.toString(),
                            amount: microAlgos(1_000),
                            note: new TextEncoder().encode("create"),
                        });

                        const prefix = new Uint8Array(Buffer.from("c"))
                        const addressBytes = algosdk.decodeAddress(activeAddress || '').publicKey
                        const boxName = new Uint8Array(prefix.length + addressBytes.length)

                        /* const { txn } = await sendTransactions(signedTransactions, waitRoundsToConfirm) */
                        //const resultado = await client.send.initStorage({ args: { mbrPayment: ptxn }, sender: sender.addr.toString() , boxReferences: [{name: prefix, appId: client.appId}], });
                        //console.log("***box result***")
                        //console.log(resultado)
                        result && toast((t) => (
                            <span>
                                {name} created with appId: &nbsp;
                                <a href={getExplorerUrl(result.appId.toString(), 'application')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                                    {result.appId.toString()}
                                </a>
                            </span>
                        ));

                    } catch (e: any) {
                        toast.error(`ERROR: ${e.toString()}`, {
                            id: 'txn',
                            duration: 5000
                        })
                    }
                }
            }
        } catch (e: any) {
            toast.error(`ERROR: ${e.toString()}`, {
                id: 'txn',
                duration: 5000
            })
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card className="max-w-[400px]">
                <CardHeader className="flex gap-3">
                    <Image
                        alt="nextui logo"
                        height={40}
                        radius="sm"
                        src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                        width={40}
                    />
                    <div className="flex flex-col">
                        <p className="text-md">Create Contract</p>
                        <p className="text-small text-default-500">Boss Battle</p>
                    </div>
                </CardHeader>
                <CardBody>
                    <Accordion defaultExpandedKeys={["1"]}>
                        <AccordionItem key="1" aria-label="Contract Info" subtitle="" title="Boss Info">
                            <Select
                                items={gods}
                                key='inside'
                                label="Name"
                                placeholder="Select a God"
                                labelPlacement='inside'
                                description='Boss Name'

                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-400 text-small">FO</span>
                                    </div>
                                }
                                onChange={(e: any) => setName(e.target.value)}
                            >
                                {(god) => <SelectItem key={god.name}>{god.name}</SelectItem>}
                            </Select>
                            <Select
                                items={[{ value: '2500' }, { value: '5000' }, { value: '10000' }]}
                                key='outside'
                                label="Healt"
                                placeholder="Select initial healt"
                                labelPlacement='inside'
                                description='Boss Initial Healt'
                                onChange={(e: any) => setRate(e.target.value)}
                            >
                                {(god) => <SelectItem key={god.value}>{god.value}</SelectItem>}
                            </Select>
                        </AccordionItem>
                    </Accordion>
                </CardBody>
                <CardFooter className="justify-center">
                    <Button
                        isExternal
                        as={Link}
                        className="text-sm font-normal text-default-600 bg-default-100"
                        startContent={''}
                        variant='light'
                        color='primary'
                        isLoading={loading}
                        isDisabled={name == '' && rate == ''}
                        onClick={() => handleCreate()}
                    >
                        Create
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
