import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Link, Image, Button } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Input } from "@nextui-org/react";
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { AresBattleFactory } from '@/artifacts/AresBattleClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { walletPretier } from '@/lib/getWalletPrettier';
import toast from 'react-hot-toast'
export const CreateBossCard = () => {
    const { activeAddress, transactionSigner } = useWalletReact()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [appID, setAppID] = React.useState<number>(0)
    const [name, setName] = React.useState<string>('Ares')
    const [rate, setRate] = React.useState<string>('25000')
    const sender = { signer: transactionSigner, addr: activeAddress! }
    const algodConfig = getAlgodConfigFromEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)

    const factory = algorand.client.getTypedAppFactory(AresBattleFactory)
    const client = factory.getAppClientById({ appId: BigInt(123) })


    const handleCreate = async () => {
        setLoading(true)
        const bossTotalHP = parseInt(rate)
        try {
            
            const { result, appClient: client } = await factory.send.create.createApplication({ sender: sender.addr, signer: sender.signer, args: [bossTotalHP, name] })

            console.log(result, client)

            /* toast.success(`Pool ${walletPretier(appAddress, 4)} Created`, {
                id: 'txn',
                duration: 5000
            }) */
        } catch (e) {
            console.log(e)
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
                        <Input
                            key='inside'
                            type="string"
                            label="Name"
                            labelPlacement='inside'
                            description='Boss Name'
                            placeholder='Ares'
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">FO</span>
                                </div>
                            }
                            onChange={(e: any) => setName(e.target.value)}
                        />
                        <Input
                            key='inside'
                            type="number"
                            label="HP"
                            labelPlacement='inside'
                            description='Total Boss Heal'
                            placeholder='25000'
                            onChange={(e: any) => setRate(e.target.value)}
                        />
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
    )
}
