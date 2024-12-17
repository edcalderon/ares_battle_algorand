'use client'
import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { ALGO_ADMIN } from '@/config/env';
import {
    Modal,
    Button,
    useDisclosure,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';
import { CreateBossCard } from '@/components/create-boss-card';

export default function DashboardAdmin() {
    const { algodClient, activeAccount } = useWallet()
    const [createdApps, setCreatedApps] = useState([])
    const [chosenAbility, setChosenAbility] = useState('')
    const [slashAbilityPoints, setSlashAbilityPoints] = useState(1);
    const [selectedAbility, setSelectedAbility] = useState('');
    const [abilityCost, setAbilityCost] = useState(0);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    useEffect(() => {
        const getAccountInfo = async () => {
            if (!activeAccount) throw new Error('No selected account.')
            const accountInfo = await algodClient.accountInformation(ALGO_ADMIN).do()
            setCreatedApps(accountInfo['created-apps'])
            return accountInfo
        }
        console.log(createdApps)
        getAccountInfo()
    }, [activeAccount])


    return (
        <>
            {activeAccount ? (
                <>
                <CreateBossCard />
                
                </>
  
            ) : (
                <p className="text-red-500">Please connect wallet</p>
            )}
        </>
    );
}
