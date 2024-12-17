import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Link, Image, Button, Select, SelectItem } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Input } from "@nextui-org/react";
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { AresBattleFactory } from '@/artifacts/AresBattleClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import toast from 'react-hot-toast'
import { allCollection } from 'greek-mythology-data';
import { useEffect } from 'react';
import { BossCard } from '@/components/boss-card';
import { ALGO_ADMIN } from '@/config/env';

export const CreateBossCard = () => {
    const { activeAddress, transactionSigner, activeAccount } = useWalletReact()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [appID, setAppID] = React.useState<number>(0)
    const [name, setName] = React.useState<string>('')
    const [rate, setRate] = React.useState<string>('')
    const [gods, setGods] = React.useState<any[]>([]);
    const [createdApps, setCreatedApps] = React.useState<any[]>([])
    const [loadingCreatedApps, setLoadingCreatedApps] = React.useState<boolean>(false);
    const sender = { signer: transactionSigner, addr: activeAddress! }
    const algodConfig = getAlgodConfigFromEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)
    const factory = algorand.client.getTypedAppFactory(AresBattleFactory)

    useEffect(() => {
        const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
        setGods(filteredData)
    }, [allCollection]);

    useEffect(() => {
        const getAccountInfo = async () => {
            setLoadingCreatedApps(true);
            if (!activeAccount) throw new Error('No selected account.')
            const accountInfo = await algorand.client.algod.accountInformation(ALGO_ADMIN).do()
            console.log(accountInfo)
            setCreatedApps(accountInfo['createdApps'] || []);
            setLoadingCreatedApps(false);
            return accountInfo
        }
        console.log(createdApps)
        getAccountInfo()
    }, [activeAccount])


    const handleCreate = async () => {
        setLoading(true)
        const bossTotalHP = parseInt(rate)
        try {

            const { result, appClient: client } = await factory.send.create.createApplication({ sender: sender.addr, signer: sender.signer, args: [bossTotalHP, name] })
            const explorerBaseUrl = algodConfig.network === 'TestNet'
                ? 'https://lora.algokit.io/testnet/application/'
                : 'https://lora.algokit.io/mainnet/application/';

            result && toast((t) => (
                <span>
                    {name} created with appId: &nbsp;
                    <a href={`${explorerBaseUrl}${result.appId}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                        {result.appId.toString()}
                    </a>
                </span>
            ));
        } catch (e) {
            toast.error(`${e}`, {
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
                                items={[{ value: '25000' }, { value: '50000' }, { value: '100000' }]}
                                key='inside'
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
            {activeAccount &&
                <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                    <h1>Created Bosses</h1>
                    {loadingCreatedApps ? (
                        <p>Loading created bosses...</p>
                    ) : createdApps.length === 0 ? (
                        <p>There are no bosses created yet.</p>
                    ) : (
                        <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
                            {createdApps.map((app: any) => (
                                <BossCard item={app} />
                            ))}
                        </div>
                    )}
                </section >
            }
        </>
    )
}
