import React from 'react'
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { useEffect } from 'react';
import { ALGO_ADMIN, CONTRACT_VERSION } from '@/config/env';
import BossTable from './boss-table';
import { getAppsFromAddressByKey } from '@/lib/getAppsFromAddress';
import { decodeGlobalState } from '@/lib/decodeGlobalState';
import CreateBossCard from './create-boss-card';

export const CreateBossTable = () => {
    const { activeAccount } = useWalletReact()
    const [createdApps, setCreatedApps] = React.useState<any[]>([])
    const [createdBosses, setCreatedBosses] = React.useState<any[]>([])
    const [loadingCreatedApps, setLoadingCreatedApps] = React.useState<boolean>(false);

    useEffect(() => {
        const getAccountInfo = async () => {
            setLoadingCreatedApps(true);
            if (!activeAccount) throw new Error('No selected account.')
            const accountInfo = await getAppsFromAddressByKey(ALGO_ADMIN, { key: 'v', value: CONTRACT_VERSION })
            setCreatedApps(accountInfo)
            setLoadingCreatedApps(false);
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
                status: decodedState && decodedState.length > 0
                    ? decodedState.find(state => state.key === 's')?.value
                    : 'Unknown',
                version: decodedState && decodedState.length > 0
                    ? decodedState.find(state => state.key === 'v')?.value
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
                        <>
                            <p>There are no bosses created yet.</p>
                            <CreateBossCard />
                        </>

                    ) : (
                        <div className="overflow-x-hidden">
                            <BossTable bosses={createdBosses} />
                        </div>
                    )}
                </section >
            }
        </>
    )
}
