import React from 'react'
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import { useEffect } from 'react';
import { ALGO_ADMIN, CONTRACT_VERSION } from '@/config/env';
import BossTable from './boss-table';
import { getAppsFromAddressByKey } from '@/lib/getAppsFromAddress';
import CreateBossCard from './create-boss-card';
import { useDecodedBosses } from '@/hooks/useDecodedBosses';

export const CreateBossTable = () => {
    const { activeAccount } = useWalletReact()
    const [createdApps, setCreatedApps] = React.useState<any[]>([])
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

    const createdBosses = useDecodedBosses(createdApps);

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
