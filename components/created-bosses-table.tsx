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
import BossTable from './boss-table';
import type { Boss } from 'types'
import { getAppsFromAddressByKey } from '@/lib/getAppsFromAddress';
import { decodeGlobalState } from '@/lib/decodeGlobalState';

export const CreateBossTable = () => {
    const { activeAccount } = useWalletReact()
    const [createdApps, setCreatedApps] = React.useState<any[]>([])
    const [createdBosses, setCreatedBosses] = React.useState<any[]>([])
    const [loadingCreatedApps, setLoadingCreatedApps] = React.useState<boolean>(false);

    useEffect(() => {
        const getAccountInfo = async () => {
            setLoadingCreatedApps(true);
            if (!activeAccount) throw new Error('No selected account.')
            const accountInfo = await getAppsFromAddressByKey(ALGO_ADMIN, 'n')
            setCreatedApps(accountInfo)
            setLoadingCreatedApps(false);
            console.log(accountInfo)
            return accountInfo
        }

        getAccountInfo()

    }, [activeAccount])

    useEffect(() => {
        const decodedAppsFormatedToBoss = createdApps.map(app => {
            const decodedState = decodeGlobalState(app.params.globalState as any).decodedStates;
            return {
                id: parseInt(app.id),
                name: decodedState && decodedState.length > 0
                    ? String(decodedState.find(state => state.key === 'n')?.value).replace(/[^a-zA-Z0-9]/g, '')
                    : 'Unknown',
                health: decodedState && decodedState.length > 0
                    ? decodedState.find(state => state.key === 'hp')?.value
                    : 'Unknown',
                governor: decodedState && decodedState.length > 0
                    ? decodedState.find(state => state.key === 'g')?.value
                    : 'Unknown',
            }
        })
        setCreatedBosses(decodedAppsFormatedToBoss)

    }, [createdApps])


    return (
        <>
            {activeAccount &&
                <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                    <h1>Created Bosses</h1>
                    {loadingCreatedApps ? (
                        <p>Loading created bosses...</p>
                    ) : createdApps.length === 0 ? (
                        <p>There are no bosses created yet.</p>
                    ) : (
                        <BossTable bosses={createdBosses} />
                    )}
                </section >
            }
        </>
    )
}
