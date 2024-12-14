import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Link, Image, Button } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Input } from "@nextui-org/react";
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { LendingPoolClient } from '@/artifacts/LendingPoolClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import AlgorandClient from '@algorandfoundation/algokit-utils/types/algorand-client'
import { walletPretier } from '@/lib/getWalletPrettier';
import toast from 'react-hot-toast'

export const CreatePoolCard = () => {
    const { activeAddress, transactionSigner } = useWalletReact()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [appID, setAppID] = React.useState<number>(0)
    const [name, setName] = React.useState<string>('')
    const [rate, setRate] = React.useState<string>('')
    const sender = { signer: transactionSigner, addr: activeAddress! }
    const algodConfig = getAlgodConfigFromEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    algorand.setDefaultSigner(transactionSigner)
    const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    //const img = `https://www.thecolorapi.com/id?format=svg&named=false&hex=${genRanHex(6)}`

    const lendingPool = new LendingPoolClient(
        {
            resolveBy: 'id',
            id: appID,
        },
        algorand.client.algod,
    );

    const handleCreate = async () => {
        setLoading(true)
        const poolRate = parseInt(rate)
        try {
            await lendingPool.create.createApplication(
                {
                    name,
                    rate: poolRate
                },
                { sender },
            )
            const { appAddress } = await lendingPool.appClient.getAppReference();
            toast.success(`Pool ${walletPretier(appAddress, 4)} Created`, {
                id: 'txn',
                duration: 5000
            })
        } catch(e) {
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
                    <p className="text-md">Create</p>
                    <p className="text-small text-default-500">Lending Pool</p>
                </div>
            </CardHeader>
            <CardBody>
                <Accordion disabledKeys={["2"]}>
                    <AccordionItem key="1" aria-label="Pool Info" subtitle="Name, Rate" title="Pool Info">
                        <Input
                            key='inside'
                            type="email"
                            label="Name"
                            labelPlacement='inside'
                            description='Provide a Pool Name'
                            onChange={(e) => setName(e.target.value)}
                        />
                       {/*  <Input
                            label="Balance"
                            placeholder="100"
                            labelPlacement="inside"
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">$</span>
                                </div>
                            }
                            description='Initial Balance'
                            endContent={
                                <div className="flex items-center">
                                    <label className="sr-only" htmlFor="currency">
                                        Currency
                                    </label>
                                    <select
                                        className="outline-none border-0 bg-transparent text-default-400 text-small"
                                        id="currency"
                                        name="currency"
                                    >
                                        <option>USDC</option>
                                        <option>ALGO</option>
                                    </select>
                                </div>
                            }
                            type="number"
                        /> */}
                        <Input
                            key='inside-2'
                            type="email"
                            label="Rate"
                            labelPlacement='inside'
                            description='Interes Rate'
                            onChange={(e) => setRate(e.target.value)}
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
