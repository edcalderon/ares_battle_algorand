'use client'
import React from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import BossBattle from '@/components/boss-battle';
import { useDecodedBosses } from '@/hooks/useDecodedBosses';
import { Spinner } from "@nextui-org/react";
import useAdminAccountInfo from '@/hooks/useAdminAccountInfo';

export default function BossDetail({
  params,
}: {
  params: { id: number; };
}) {
  const { activeAccount } = useWallet();
  const { createdApps, loadingCreatedApps } = useAdminAccountInfo();
  const createdBosses = useDecodedBosses(createdApps);
  const currentBoss = createdBosses.find(boss => boss.id === params.id);

  return (
    <>
      {activeAccount ? (
        <>
          <h1 className="text-orange-500 text-4xl font-bold">
            BOSS #{currentBoss?.id}
          </h1>
          {loadingCreatedApps ? (
            <>
              <Spinner color="warning" label="Loading Bosses..." />
            </>
          ) : (
            <div className="flex justify-between">
              <BossBattle
                id={currentBoss?.id}
                name={currentBoss?.name}
                health={currentBoss?.health}
                maxHealth={currentBoss?.maxHealth}
                status={currentBoss?.status}
                version={currentBoss?.version}
                governor={currentBoss?.governor}
                pool={currentBoss?.pool}
                contributors={currentBoss?.contributors}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-red-500">Please connect wallet</p>
      )}
    </>
  );
}