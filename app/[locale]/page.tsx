'use client'
import React from 'react';
import LandingPage from './landing'
import { Breadcrumb } from '@/components/breadcrumb';
import { usePathname, useRouter } from 'next/navigation'
import { useWallet } from '@txnlab/use-wallet-react';

export default function Home() {
  const { activeAccount } = useWallet()
  const pathname = usePathname();

  React.useEffect(() => {
    console.log(`Route changed to: ${pathname}`);

  }, [pathname]);
  
  return (
    <>
      {activeAccount && <Breadcrumb path='/Home' /> }
      <LandingPage />
    </>

  );
}
