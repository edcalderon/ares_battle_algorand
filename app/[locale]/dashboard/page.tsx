'use client'
import React from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import BossBattle from '@/components/boss-battle';
import { useDecodedBosses } from '@/hooks/useDecodedBosses';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Spinner } from "@nextui-org/react";
import useAdminAccountInfo from '@/hooks/useAdminAccountInfo';
import { ALGO_ADMIN } from '@/config/env';;

export default function Dashboard() {
    const { activeAccount } = useWallet();
    const { createdApps, loadingCreatedApps } = useAdminAccountInfo();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const createdBosses = useDecodedBosses(createdApps);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % createdBosses.length;
            return nextIndex < 0 ? 0 : nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexCalc = (prevIndex - 1 + createdBosses.length) % createdBosses.length;
            return prevIndexCalc < 0 ? createdBosses.length - 1 : prevIndexCalc;
        });
    };

    return (
        <>
            {activeAccount ? (
                <>
                    <h1 className="text-orange-500 text-4xl font-bold">
                        THUNDERDOME 
                    </h1>
                    {loadingCreatedApps ? (
                        <>  
                            <Spinner color="warning" label="Loading Bosses..." />
                        </>

                    ) : createdBosses.length > 0 ? <>
                        <div className="flex justify-between">
                            <div
                                className="cursor-pointer w-16 h-full flex items-center justify-center"
                                onClick={handlePrev}
                            >
                                <FaArrowLeft />
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
                                <FaArrowRight />
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
