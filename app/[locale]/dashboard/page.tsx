'use client'
import React, { useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { ALGO_ADMIN, CONTRACT_VERSION } from '@/config/env';;
import BossBattle from '@/components/boss-battle';
import { getAppsFromAddressByKey } from '@/lib/getAppsFromAddress';
import { useDecodedBosses } from '@/hooks/useDecodedBosses';

export default function Dashboard() {
    const { algodClient, activeAccount } = useWallet();
    const [createdApps, setCreatedApps] = React.useState<any[]>([])
    const [loadingCreatedApps, setLoadingCreatedApps] = React.useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);

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
        console.log(createdApps)

    }, [activeAccount])

    const createdBosses = useDecodedBosses(createdApps);
    console.log(createdBosses)

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % createdBosses.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + createdBosses.length) % createdBosses.length);
    };

    return (
        <>
            {activeAccount ? (
                <>
                    <h1 className="text-orange-500 text-4xl font-bold">
                        THUNDERDOME
                    </h1>
                    { createdBosses.length > 0 ? <>
                    <div className="flex justify-between">
                        <div 
                            className="cursor-pointer w-16 h-full flex items-center justify-center" 
                            onClick={handlePrev}
                        >
                            &lt;
                        </div>            
                            <BossBattle
                                id={createdBosses[currentIndex].id}
                                name={createdBosses[currentIndex].name}
                                health={createdBosses[currentIndex].health}
                                maxHealth={createdBosses[currentIndex].maxHealth}
                                status={createdBosses[currentIndex].status}
                                version={createdBosses[currentIndex].version}
                                governor={createdBosses[currentIndex].governor}
                                pool={createdBosses[currentIndex].pool}
                                contributors={createdBosses[currentIndex].contributors}
                            />
                            <div 
                                className="cursor-pointer w-16 h-full flex items-center justify-center" 
                                onClick={handleNext}
                            >
                                &gt;
                            </div>                
                    </div>
                    </>
                    : (
                        <p className="text-yellow-500">There its not bosses jet</p>
                    )}
                </>

            ) : (
                <p className="text-red-500">Please connect wallet</p>
            )}
        </>
    );
}
