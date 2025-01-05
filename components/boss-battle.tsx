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
    Chip,
    Accordion,
    AccordionItem,
} from '@nextui-org/react';
import { walletPretier } from '@/lib/getWalletPrettier';
import { allCollection } from 'greek-mythology-data';
import { getExplorerUrl } from '@/lib/getExplorerUrl';
import { SearchIcon } from '@/lib/icons';
import { AresBattleClient } from '@/artifacts/AresBattleClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import { AlgorandClient, microAlgos } from '@algorandfoundation/algokit-utils'
import toast from 'react-hot-toast'
import { Contributor } from '@/types';

export default function BossBattle({ id, name, governor, status, version, health, maxHealth, pool, contributors }: any) {
    const { algodClient, activeAccount, transactionSigner, activeAddress } = useWallet()
    const [createdApps, setCreatedApps] = useState([])
    const [chosenAbility, setChosenAbility] = useState('')
    const [slashAbilityPoints, setSlashAbilityPoints] = useState(1);
    const [selectedAbility, setSelectedAbility] = useState('');
    const [abilityCost, setAbilityCost] = useState(0);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [gods, setGods] = React.useState<any[]>([]);
    const algodConfig = getAlgodConfigFromEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    const sender = { signer: transactionSigner, addr: activeAddress! }
    algorand.setDefaultSigner(transactionSigner)
    const [isLoading, setIsLoading] = useState(false);
    const [currentHealth, setCurrentHealth] = useState(health);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [isLoadingRecentActions, setIsLoadingRecentActions] = useState(false);
    const [currentContributors, setCurrentContributors] = useState<any[]>(contributors);
    const [resentAction, setResentAction] = useState<[contributor: Contributor, action: string]>();
    const [currentPool, setCurrentPool] = useState<number>(pool);

    const client = algorand.client.getTypedAppClientById(AresBattleClient, {
        appId: BigInt(id),
    })

    React.useEffect(() => {
        const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
        setGods(filteredData)
    }, [allCollection]);

    const godImage = (name: string) => gods.find(god => god.name === name)?.images?.regular;
    const godDescription = (name: string) => gods.find(god => god.name === name)?.description;
    const godGender = (name: string) => gods.find(god => god.name === name)?.gender;
    const godGreekName = (name: string) => gods.find(god => god.name === name)?.greekName;
    const godCategory = (name: string) => gods.find(god => god.name === name)?.category;
    const godRomanName = (name: string) => gods.find(god => god.name === name)?.romanName;

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

    const abilityImages: { [key: string]: string } = {
        SLASH: "https://storage.googleapis.com/a1aa/image/kkE4eHVbgvWMS6wc9JIiAaMzR2fnDbf51XCHDSevHyguzsrPB.jpg",
        HEAL: "https://storage.googleapis.com/a1aa/image/4Fs5T04OOqrPNRUBdnvxDxwZ429OIEowDSkOMVeLjuxcmd9JA.jpg",
        NUKE: "https://storage.googleapis.com/a1aa/image/DS8FJe2dNw0YESR5Tng65yfPAppeCO3uEbBdH5HMSe3emZXfE.jpg",
    };

    const setCurrentHealthOnChange = (prevHealth: number, healthChange: number) => {
        setCurrentHealth(Math.min(maxHealth, Math.max(0, prevHealth + healthChange)));
    }

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            let result;
            let healthChange = 0;
            switch (selectedAbility) {
                case 'SLASH':
                    //console.log(`Using ability: SLASH for ${abilityCost} Algo`);

                    const ptxn = await algorand.createTransaction.payment({
                        sender: sender.addr.toString(),
                        receiver: client.appAddress.toString(),
                        amount: microAlgos(1_000 * slashAbilityPoints),
                        note: new TextEncoder().encode("slash"),
                    });
                    result = await client.send.slash({ args: { user: sender.addr.toString(), damagePayment: ptxn, times: BigInt(slashAbilityPoints) }, sender: sender.addr.toString() });
                    healthChange -= 1;
                    break;
                case 'HEAL':
                    console.log(`Using ability: HEAL for ${abilityCost} Algo`);
                    // Add logic for HEAL ability here
                    healthChange += 50;
                    break;
                case 'NUKE':
                    console.log(`Using ability: NUKE! for ${abilityCost} Algo`);
                    // Add logic for NUKE! ability here
                    healthChange -= 20;
                    break;
                default:
                    console.log('Unknown ability');
            }

            if (result) {
                setCurrentHealthOnChange(currentHealth, healthChange)
                const updatedContributors = currentContributors.map(contributor => {
                    if (contributor.address === activeAddress) {
                        setResentAction([contributor, "SLASH"])
                        return {
                            ...contributor,
                            contribution: parseInt(contributor.contribution) + (slashAbilityPoints * 1000)
                        };
                    }
                    return contributor;
                });
                setCurrentContributors(updatedContributors);
                setCurrentPool(currentPool + slashAbilityPoints * 1000)
                toast.custom((t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={abilityImages[selectedAbility]}
                                        alt={selectedAbility}
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        You &nbsp;
                                        <span className={selectedAbility === 'NUKE' || selectedAbility === 'SLASH' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                            {selectedAbility}ED &nbsp;
                                        </span>
                                        <span className="font-bold">
                                            {name.toString().toUpperCase()}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        <span className={selectedAbility === 'NUKE' || selectedAbility === 'SLASH' ? 'text-red-500' : 'text-green-500'}>
                                            {abilityCost * 100}
                                        </span> {selectedAbility === 'NUKE' || selectedAbility === 'SLASH' ? 'Damage' : 'Heal'} {abilityCost > 1 ? 'Points' : 'Point'} made!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ), {
                    position: "top-center"
                })
            } else {
                toast.error(`!`);
                throw new Error('No result returned');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error executing ${selectedAbility}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
        onClose();
    };

    const fetchRecentActions = async () => {
        setIsLoadingRecentActions(true);
        try {

            // Sort actions by timestamp in descending order
            const unsortedActions = contributors
            const sortedActions = unsortedActions.reverse()
            console.log(sortedActions)
            setRecentActions(sortedActions);
        } catch (error) {
            console.error('Error fetching recent actions:', error);
        } finally {
            setIsLoadingRecentActions(false);
        }
    };

    useEffect(() => {
        fetchRecentActions();
    }, [currentHealth]);

    useEffect(() => {
        setCurrentContributors(contributors);
    }, [contributors]);

    return (
        <>
            <div className="text-center">
                <p className="text-white text-lg mt-4">
                    {name.toString().toUpperCase()} #{walletPretier(id.toString(), 2)}, {godDescription(name) ? godDescription(name).split(',')[0] : 'Description not available.'}.
                </p>
                <Accordion>
                    <AccordionItem title="Contract Info">
                        <div className="grid grid-cols-2 gap-2 text-sm text-white">
                            <div>
                                <p className="text-left"><span className="font-bold text-yellow-400">Name:</span> {name}</p>
                                <p className="text-left"><span className="font-bold text-yellow-400">AppId:</span>
                                    &nbsp;
                                    <a href={getExplorerUrl(id.toString(), 'application')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                                        {id} <SearchIcon className="inline-block h-4 w-4 mr-1" aria-hidden="true" />
                                    </a>
                                </p>
                            </div>
                            <div>
                                <p className="text-left"><span className="font-bold text-yellow-400">Max Health:</span> {health}</p>
                                <p className="text-left"><span className="font-bold text-yellow-400">Governor:</span> {walletPretier(governor, 4)}</p>
                            </div>
                            <div>
                                <p className="text-left"><span className="font-bold text-yellow-400">Boss Status:</span>
                                    &nbsp;
                                    <Chip color={status === 'ACTIVE' ? 'success' : status === 'PAUSED' ? 'danger' : 'warning'} className="mt-1">
                                        {status}
                                    </Chip>
                                </p>

                                <p className="text-left"><span className="font-bold text-yellow-400">Contract Version:</span> {version}</p>
                            </div>
                        </div>
                    </AccordionItem>
                </Accordion>
                <img alt="Ares, God of War holding a shield and a sword" className="mx-auto mt-4" height="300" src={godImage(name)} width="300" />
                <div className="w-full max-w-md mx-auto mt-4">
                    <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${currentHealth / maxHealth * 100}%` }}>
                        </div>
                    </div>
                    <p className="text-white text-center mt-2">
                        {currentHealth} / {maxHealth}
                    </p>
                </div>
                <Accordion>
                    <AccordionItem title="God Info">
                        <div className="grid grid-cols-2 gap-2 text-sm text-white">
                            <div>
                                <p className="text-left">
                                    <span className="font-bold text-yellow-400">Gender:</span> {godGender(name) || 'Not specified'}
                                </p>
                                <p className="text-left">
                                    <span className="font-bold text-yellow-400">Greek Name:</span> {godGreekName(name) || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <p className="text-left">
                                    <span className="font-bold text-yellow-400">Category:</span> {godCategory(name) || 'Not specified'}
                                </p>
                                <p className="text-left">
                                    <span className="font-bold text-yellow-400">Roman Name:</span> {godRomanName(name) || 'Not specified'}
                                </p>
                            </div>
                        </div>
                        <h2> {name.toString().toUpperCase()}</h2>
                        <p>{godDescription(name)}</p>
                    </AccordionItem>
                </Accordion>

                <p className="text-yellow-400 text-lg mt-2">
                    Prize Pool:
                    <span className="text-white">
                        {currentPool / 100000 || 0}
                        <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                        <i className="fas fa-coins">
                        </i>
                    </span>
                </p>
                <div className="bg-black border border-yellow-400 rounded-lg p-2 mt-4 inline-block">
                    <p className="text-yellow-400 text-sm">Most Recent Actions</p>
                    {isLoadingRecentActions ? (
                        <div className="text-center text-white">
                            Loading recent actions...
                            <div className="loader"></div>
                        </div>
                    ) : (
                        recentActions.length > 0 ? (
                            <div key={0} className="text-red-500 text-lg font-bold">
                                ⚔️ {resentAction && resentAction[0].contribution || 0} 🗡️
                                <p className="text-orange-400 text-sm">
                                    🧑🤝‍🤝 {resentAction && walletPretier(resentAction[0].address, 4) || 'No One' }
                                </p>
                                <p className="text-red-500 text-sm">
                                    {resentAction && resentAction[1] || '' } 
                                </p>
                            </div> 
                        ): <></>
                    )}
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
                            <img alt="Slash icon" className="mx-auto mt-2" height="50" src={abilityImages['SLASH']} width="50" />
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
                        <img alt="Heal icon" className="mx-auto mt-2" height="50" src={abilityImages['HEAL']} width="50" />
                        <p className="text-white mt-2">
                            0.8
                            <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                            <i className="fas fa-coins">
                            </i>
                        </p>
                    </button>
                    <button className="text-center" onClick={() => handleAbilityClick('NUKE', 1.33)}>
                        <p className="text-yellow-500 font-bold">
                            NUKE!
                        </p>
                        <p className="text-yellow-500 text-sm">
                            100-200 DMG
                        </p>
                        <img alt="Nuke icon" className="mx-auto mt-2" height="50" src={abilityImages['NUKE']} width="50" />
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
                                    <Button color="primary" isLoading={isLoading} onClick={handleConfirm}>
                                        Confirm
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                &nbsp;
                <div className="text-center">
                    <h1 className="text-4xl mb-2">Leaderboard</h1>
                    <p className="text-lg mb-4">Players: {contributors.length || 0}</p>
                    <div className="leaderboard w-full max-w-md mx-auto">
                        <div className="leaderboard-header">
                            <i className="fas fa-user"></i>
                            <i className="fas fa-trophy"></i>
                        </div>
                        {currentContributors && currentContributors.map((contributor: Contributor) => (
                            <div className="leaderboard-item" key={contributor.address}>
                                <span>
                                    <a href={getExplorerUrl(contributor.address, 'account')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                                        {walletPretier(contributor.address, 4)}
                                    </a>
                                </span>
                                <span>{contributor.contribution}</span>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </>
    );
}
