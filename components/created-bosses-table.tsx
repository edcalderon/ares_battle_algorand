import React from 'react'
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import useAdminAccountInfo from '@/hooks/useAdminAccountInfo'
import { useDecodedBosses } from '@/hooks/useDecodedBosses';
import BossTable from './boss-table';
import CreateBossCard from './create-boss-card';

export const CreateBossTable = () => {
    const { activeAccount } = useWalletReact()
    const { createdApps, loadingCreatedApps } = useAdminAccountInfo()
    const createdBosses = useDecodedBosses(createdApps)

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
