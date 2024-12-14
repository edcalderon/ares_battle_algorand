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

export default function Dashboard() {
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

    const handleAbilityClick = (ability: string, cost: number) => {
        setSelectedAbility(ability);
        setAbilityCost(cost);
        onOpen();
    };

    const handleConfirm = () => {
        console.log(`Using ability: ${selectedAbility} for ${abilityCost} Algo`);
        onClose();
    };


    return (
        <>
            {activeAccount ? (
                <div className="text-center">
                    <h1 className="text-orange-500 text-4xl font-bold">
                        THUNDERDOME
                    </h1>
                    <p className="text-yellow-400 text-lg mt-2">
                        Prize Pool:
                        <span className="text-white">
                            51.882
                            <i className="fas fa-coins">
                            </i>
                        </span>
                    </p>
                    <div className="bg-black border border-yellow-400 rounded-lg p-2 mt-4 inline-block">
                        <p className="text-yellow-400 text-sm">
                            Most Recent Action
                        </p>
                        <p className="text-red-500 text-lg font-bold">
                            ⚔️ SLASH 🗡️
                        </p>
                        <p className="text-orange-400 text-sm">
                            🧑‍🤝‍🧑 fozzyy.coop.algo
                        </p>
                        <p className="text-red-500 text-sm">
                            23 DMG
                        </p>
                    </div>
                    <p className="text-white text-lg mt-4">
                        Ares, God of War
                    </p>
                    <img alt="Ares, God of War holding a shield and a sword" className="mx-auto mt-4" height="300" src="https://storage.googleapis.com/a1aa/image/VbyccWV8o66hJxJLTCyLXyvXencynedt136S29SUsDX2M76TA.jpg" width="300" />
                    <div className="w-full max-w-md mx-auto mt-4">
                        <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: '84%' }}>
                            </div>
                        </div>
                        <p className="text-white text-center mt-2">
                            20903 / 25000
                        </p>
                    </div>
                    <p className="text-orange-500 text-lg mt-4">
                        Choose Ability
                    </p>
                    <div className="flex justify-center mt-4 space-x-4">
                        <div>
                            <button className="text-center" onClick={() => handleAbilityClick('SLASH', parseFloat((slashAbilityPoints * 0.01).toFixed(2)))}>
                                <p className="text-red-500 font-bold">
                                    SLASH
                                </p>
                                <p className="text-red-500 text-sm">
                                    1-1.2x DMG
                                </p>
                                <img alt="Slash icon" className="mx-auto mt-2" height="50" src="https://storage.googleapis.com/a1aa/image/kkE4eHVbgvWMS6wc9JIiAaMzR2fnDbf51XCHDSevHyguzsrPB.jpg" width="50" />
                            </button>
                            <div className="flex items-center justify-center mt-2 space-x-2">
                                <button
                                    className="bg-gray-700 text-white px-2 py-1 rounded"
                                    onClick={() => setSlashAbilityPoints(prev => Math.max(1, prev - 1))}
                                >
                                    -
                                </button>
                                <span className="text-white">
                                    {slashAbilityPoints}
                                </span>
                                <button
                                    className="bg-gray-700 text-white px-2 py-1 rounded"
                                    onClick={() => setSlashAbilityPoints(prev => Math.min(100, prev + 1))}
                                >
                                    +
                                </button>
                            </div>
                            <p className="text-white mt-2">
                                {(slashAbilityPoints * 0.01).toFixed(2)}
                                <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                                <i className="fas fa-coins">
                                </i>
                            </p>
                        </div>

                        <button className="text-center" onClick={() => handleAbilityClick('HEAL', 0.8)}>
                            <p className="text-green-500 font-bold">
                                HEAL
                            </p>
                            <p className="text-green-500 text-sm">
                                50-150 HP
                            </p>
                            <img alt="Heal icon" className="mx-auto mt-2" height="50" src="https://storage.googleapis.com/a1aa/image/4Fs5T04OOqrPNRUBdnvxDxwZ429OIEowDSkOMVeLjuxcmd9JA.jpg" width="50" />
                            <p className="text-white mt-2">
                                0.8
                                <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                                <i className="fas fa-coins">
                                </i>
                            </p>
                        </button>
                        <button className="text-center" onClick={() => handleAbilityClick('NUKE!', 1.33)}>
                            <p className="text-yellow-500 font-bold">
                                NUKE!
                            </p>
                            <p className="text-yellow-500 text-sm">
                                100-200 DMG
                            </p>
                            <img alt="Nuke icon" className="mx-auto mt-2" height="50" src="https://storage.googleapis.com/a1aa/image/DS8FJe2dNw0YESR5Tng65yfPAppeCO3uEbBdH5HMSe3emZXfE.jpg" width="50" />
                            <p className="text-white mt-2">
                                1.33
                                <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                                <i className="fas fa-coins">
                                </i>
                            </p>
                        </button>
                    </div>

                    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                        <ModalContent>
                            {(onClose: any) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Confirm Ability</ModalHeader>
                                    <ModalBody>
                                        <p>You are going to use <strong>{selectedAbility}</strong> for <strong>{abilityCost} Algo</strong>.</p>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Close
                                        </Button>
                                        <Button color="primary" onClick={handleConfirm}>
                                            Confirm
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>
            ) : (
                <p className="text-red-500">Please connect wallet</p>
            )}
        </>
    );
}
