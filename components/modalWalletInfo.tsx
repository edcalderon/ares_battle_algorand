import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { copyToClipboard } from './copy-to-clipboard';
import { ClipboardIcon } from '@heroicons/react/20/solid'
import { walletPretier } from '@/lib/getWalletPrettier';

export const ModalWalletInfo = ({isOpen, onClose, activeAccount, activeWallet, handleDisconnect}: any) => {

    const getWalletIcon = (wallet: any) => {
        return <img
            width={30}
            height={30}
            alt={`${wallet.name} icon`}
            src={wallet.icon}
        />
    }

    return (
        <Modal backdrop={'opaque'} isOpen={isOpen} onClose={onClose}  style={{zIndex: '99999'}}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalBody>
                            <h2>Active Account</h2>
                            <Button
                                data-clipboard-text={activeAccount.address}
                                startContent={getWalletIcon(activeWallet.metadata)}
                                data-clipboard-message="Address copied to clipboard"
                                onClick={copyToClipboard}
                                variant='flat'
                                id="copy-address"
                                data-tooltip-content="Copy address"
                            >
                                <span className="">{walletPretier(activeAccount?.address, 8)}</span>
                                <ClipboardIcon className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            <Button
                                color="danger"
                                variant="light"
                                disableRipple
                                onClick={() => handleDisconnect()}
                            >
                                Disconnect
                            </Button>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
