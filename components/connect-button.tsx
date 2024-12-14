'use client'
import React from 'react'
import { Link } from "@nextui-org/link";
import { useWallet } from '@txnlab/use-wallet-react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, User } from "@nextui-org/react";
import { copyToClipboard } from './copy-to-clipboard';
import { ClipboardIcon } from '@heroicons/react/20/solid'
import { walletPretier } from '@/lib/getWalletPrettier';
import { useTranslations } from "next-intl";
import { ModalWalletInfo } from './modalWalletInfo';

export default function ConnectButton({ position }: any) {
    const { wallets, activeWallet, activeAccount } = useWallet()
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isOpenModal, setIsOpenModal] = React.useState(false)
    const [backdrop, setBackdrop] = React.useState('opaque')
    const t = useTranslations("Wallet");

    const getWalletIcon = (wallet: any) => {
        return <img
            width={30}
            height={30}
            alt={`${wallet.name} icon`}
            src={wallet.icon}
        />
    }

    const handleOpen = (position: string) => {
        setIsOpenModal(true)
    }

    const handleCloseModal = () => {
        setIsOpenModal(false)
    }

    const handleDisconnect = () => {
        activeWallet.disconnect()
        onClose()
    }

    return (
        <>
            {!activeWallet &&
                <Dropdown backdrop="blur">
                    <DropdownTrigger>
                        <Button
                            isExternal
                            as={Link}
                            className="text-sm font-normal text-default-600 bg-default-100"
                            startContent={''}
                            variant='bordered'
                            color='secondary'
                        >
                            {t("connect-btn")}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu variant="faded" aria-label="Static Actions">
                        {wallets.map((wallet: any) => (
                            <DropdownItem
                                key={wallet.id}
                                startContent={getWalletIcon(wallet.metadata)}
                            >
                                <button onClick={() => wallet.connect()}>{wallet.metadata.name}</button>
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>}

            {activeWallet && position == 'nav' &&
                <Button
                    isExternal
                    as={Link}
                    className="text-sm font-normal text-default-600 bg-default-100"
                    startContent={''}
                    variant='flat'
                    color='primary'
                    onClick={() => handleOpen(position)}
                >
                    {!activeWallet ? 'Connect Wallet' : `${walletPretier(activeAccount?.address, 4)}`}
                </Button>
            }
            {activeWallet && position == 'nav-menu' &&
                <Button
                    isExternal
                    as={Link}
                    className="text-sm font-normal text-default-600 bg-default-100"
                    startContent={''}
                    variant='faded'
                    color='primary'
                    onClick={() => handleOpen(position)}
                >
                    {!activeWallet ? 'Connect Wallet' : `${walletPretier(activeAccount?.address, 4)}`}
                </Button>
            }

            {activeWallet && <ModalWalletInfo
                isOpen={isOpenModal}
                onClose={handleCloseModal}
                activeAccount={activeAccount}
                activeWallet={activeWallet}
                handleDisconnect={handleDisconnect}
            />}
        </>
    )
}
