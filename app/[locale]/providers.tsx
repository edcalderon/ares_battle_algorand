"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import CustomToaster from "@/components/Toaster";
//@ts-ignore
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  const walletManager = new WalletManager({
    wallets: [
      WalletId.DEFLY,
      {
        id: WalletId.PERA,
        options: { projectId: '57a8c8fd62b41b0d8bcbe461bc14bb35' }
      },
      {
        id: WalletId.WALLETCONNECT,
        options: { projectId: '57a8c8fd62b41b0d8bcbe461bc14bb35' }
      },
    ],
    network: NetworkId.TESTNET,
    algod: {
      [NetworkId.TESTNET]: {
        token: '',
        baseServer: 'https://testnet-api.algonode.cloud',
        port: 443
      },
      [NetworkId.MAINNET]: {
        token: '',
        baseServer: 'https://mainnet-api.algonode.cloud',
        port: 443
      }
    }
  })

  return (
    <>
      <CustomToaster />
        <WalletProvider manager={walletManager}>
          <NextUIProvider navigate={router.push}>
            <NextThemesProvider {...themeProps}>
              {children}
            </NextThemesProvider>
          </NextUIProvider>
        </WalletProvider>
    </>
  );
}
