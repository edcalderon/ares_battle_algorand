'use client'
import { useWallet } from '@txnlab/use-wallet-react'
import { CreateBossTable } from '@/components/created-bosses-table';

export default function DashboardAdmin() {
    const { activeAccount } = useWallet()

    return (
        <>
            {activeAccount ? (
                <CreateBossTable />
            ) : (
                <p className="text-red-500">Please connect wallet</p>
            )}
        </>
    );
}
