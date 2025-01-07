'use client'
import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
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
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Tooltip,
    Pagination,
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
import { useAsyncList } from "@react-stately/data";
import { SortDescriptor } from "@react-types/shared";
import useAppInfo from '@/hooks/useAppInfoToBossFormat';

export default function BossBattle({ id, name, governor, status, version, health, maxHealth, pool, contributors }: any) {
    const { transactionSigner, activeAddress } = useWallet()
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
    const [currentId, setCurrentId] = useState(id);
    const [currentHealth, setCurrentHealth] = useState(health);
    const [recentActions, setRecentActions] = useState<any[]>([]);
    const [isLoadingRecentActions, setIsLoadingRecentActions] = useState(false);
    const [currentContributors, setCurrentContributors] = useState<Contributor[]>(contributors);
    const [resentAction, setResentAction] = useState<[contributor: Contributor, action: string]>();
    const [currentPool, setCurrentPool] = useState<number>(pool);
    const [isLoadingTable, setIsLoadingTable] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const appInfo = useAppInfo(currentId)

    const client = algorand.client.getTypedAppClientById(AresBattleClient, {
        appId: BigInt(id),
    })

    React.useEffect(() => {
        const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
        setGods(filteredData)
    }, [allCollection]);

    useEffect(() => {
        setCurrentId(id)
        setCurrentHealth(health)
        setCurrentPool(pool)
        setCurrentContributors(appInfo.decodedBossInfo?.contributors || [])
        reloadList()
    }, [id]);

    const godImage = (name: string) => gods.find(god => god.name === name)?.images?.regular;
    const godDescription = (name: string) => gods.find(god => god.name === name)?.description;
    const godGender = (name: string) => gods.find(god => god.name === name)?.gender;
    const godGreekName = (name: string) => gods.find(god => god.name === name)?.greekName;
    const godCategory = (name: string) => gods.find(god => god.name === name)?.category;
    const godRomanName = (name: string) => gods.find(god => god.name === name)?.romanName;


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

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            let result;
            let healthChange = 0;
            let contributionChange = 0;

            switch (selectedAbility) {
                case 'SLASH':
                    const dtxn = await algorand.createTransaction.payment({
                        sender: sender.addr.toString(),
                        receiver: client.appAddress.toString(),
                        amount: microAlgos(1_000 * slashAbilityPoints),
                        note: new TextEncoder().encode("slash"),
                    });
                    result = await client.send.slash({ args: { damagePayment: dtxn, times: BigInt(slashAbilityPoints) }, sender: sender.addr.toString() });
                    healthChange -= slashAbilityPoints;
                    contributionChange = slashAbilityPoints;
                    break;
                case 'HEAL':
                    const htxn = await algorand.createTransaction.payment({
                        sender: sender.addr.toString(),
                        receiver: client.appAddress.toString(),
                        amount: microAlgos(8_000_00),
                        note: new TextEncoder().encode("heal"),
                    });
                    result = await client.send.heal({ args: { healPayment: htxn }, sender: sender.addr.toString() });
                    healthChange += 80;
                    break;
                case 'NUKE':
                    const ntxn = await algorand.createTransaction.payment({
                        sender: sender.addr.toString(),
                        receiver: client.appAddress.toString(),
                        amount: microAlgos(1_330_000),
                        note: new TextEncoder().encode("heal"),
                    });
                    result = await client.send.nuke({ args: { nukePayment: ntxn }, sender: sender.addr.toString() });
                    healthChange -= 133;
                    break;
                default:
                    console.log('Unknown ability');
            }

            if (result) {
                const bonusPoints = currentHealth - parseInt(result.return?.toString() || '0');
                setCurrentHealth(result.return?.toString() || currentHealth.toString());

                const updatedContributors = currentContributors.map(contributor => {
                    if (contributor.address === activeAddress) {
                        setResentAction([contributor, selectedAbility]);
                        const newContribution = contributor.contribution + contributionChange;
                        console.log(list.getItem(contributor.address))
                        list.update(contributor.address, {
                            address: contributor.address,
                            contribution: newContribution + 1
                        });
                        return {
                            ...contributor,
                            contribution: newContribution + 1
                        };
                    }
                    return contributor;
                });
                setCurrentContributors(updatedContributors);
                reloadList()
                setCurrentPool(currentPool + Math.abs(healthChange) * 10000);
                toast.custom((t:any) => (
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
                                            {selectedAbility}D &nbsp;
                                        </span>
                                        <span className="font-bold">
                                            {name.toString().toUpperCase()}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        <span className={selectedAbility === 'NUKE' || selectedAbility === 'SLASH' ? 'text-red-500' : 'text-green-500'}>
                                            {abilityCost * 100} + {selectedAbility === 'NUKE' && bonusPoints}
                                        </span> {selectedAbility === 'NUKE' || selectedAbility === 'SLASH' ? `Damage ${selectedAbility === 'NUKE' && 'with Random Bonus '}` : 'Heal'} {abilityCost > 1 ? 'Points' : 'Point'} made!
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
            toast.error(`Error executing ${selectedAbility}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
        onClose();
    };

    const fetchRecentActions = async () => {
        setIsLoadingRecentActions(true);
        try {
            const unsortedActions = contributors;
            const sortedActions = unsortedActions.reverse();
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


    const list = useAsyncList<Contributor>({
        async load({  }) {
            try {
                setIsLoadingTable(false);
                return {
                    items: currentContributors,
                    cursor: undefined
                };
            } catch (e) {
                console.log(e);
                setIsLoadingTable(false);
                return {
                    items: [],
                    cursor: undefined
                };
            }
        },
        async sort({ items, sortDescriptor }: { items: Contributor[], sortDescriptor: SortDescriptor }) {
            return {
                items: items.sort((a, b) => {
                    let first = a[sortDescriptor.column as keyof Contributor];
                    let second = b[sortDescriptor.column as keyof Contributor];
                    let cmp = (parseInt(first as string) || first) < (parseInt(second as string) || second) ? -1 : 1;

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
        getKey: (contributor: Contributor) => contributor.address
    });

    const reloadList = async() => {
        list.reload();  
    };


    const rowsPerPage = 1
    const pages = React.useMemo(() => {
        return list?.items.length ? Math.ceil(list.items.length / rowsPerPage)  - 1 : 0;
    }, [list?.items.length, rowsPerPage]);

    const loadingState = isLoadingTable || list?.items.length === 0 ? "loading" : "idle";

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
                                <p className="text-left"><span className="font-bold text-yellow-400">App Id:</span>
                                    &nbsp;
                                    <a href={getExplorerUrl(id?.toString() || '', 'application')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                                        {id?.toString()}
                                    </a>
                                    &nbsp;
                                    <SearchIcon className="inline-block h-4 w-4 mr-1" aria-hidden="true" />
                                </p>
                                <p className="text-left"><span className="font-bold text-yellow-400">Boss Status:</span>
                                    &nbsp;
                                    <Chip color={status === 'ALIVE' ? 'success' : status === 'PAUSED' ? 'danger' : 'warning'} className="mt-1">
                                        {status}
                                    </Chip>
                                </p>
                            </div>
                            <div>
                                <p className="text-left"><span className="font-bold text-yellow-400">Max Health:</span> {maxHealth}</p>
                                <p className="text-left"><span className="font-bold text-yellow-400">Deployer:</span> {walletPretier(governor, 4)}</p>
                                <p className="text-left"><span className="font-bold text-yellow-400">Governor:</span> {walletPretier(governor, 4)}</p>
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
                    Prize Pool ≈ {' '}
                    <span className="text-white">
                        {' '}
                        <a href={getExplorerUrl(client.appAddress.toString(), 'account')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                            {currentPool / 1000000 || 0}
                        </a>
                        <img alt="Algorand logo" className="inline-block h-4 w-4" src="/algologo.png" />
                        <Tooltip content="* (Aprox. Value) Prize Pool = Contract Balance - Creation Balance.">
                            <span className="text-yellow-400">*</span>
                        </Tooltip>
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
                                    🧑🤝‍🤝 {resentAction && walletPretier(resentAction[0].address, 4) || 'No One'}
                                </p>
                                <p className="text-red-500 text-sm">
                                    {resentAction && resentAction[1] || ''}
                                </p>
                            </div>
                        ) : <></>
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
                    <Table
                        isHeaderSticky
                        aria-label="Leaderboard"
                        classNames={{
                            table: "min-h-[100px]",
                        }}
                        sortDescriptor={list.sortDescriptor as SortDescriptor}
                        onSortChange={list.sort as (descriptor: SortDescriptor) => void}
                        bottomContent={<>
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="secondary"
                                    page={page}
                                    total={pages}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        </>
                        }

                    >
                        <TableHeader>
                            <TableColumn key="address" allowsSorting>
                                Player
                            </TableColumn>
                            <TableColumn key="contribution" allowsSorting>
                                Points
                            </TableColumn>
                        </TableHeader>
                        <TableBody
                            isLoading={isLoadingTable}
                            items={list.items}
                            loadingContent={<Spinner label="Loading..." />}
                            loadingState={loadingState}
                        >
                            {(item: Contributor) => (
                                <TableRow key={item.address}>
                                    {(columnKey: any) => (
                                        <TableCell>
                                            {columnKey === "address" ? (
                                                <>
                                                    <a href={getExplorerUrl(item.address, 'account')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#aa8b0d' }}>
                                                        {walletPretier(item.address, 4)}
                                                    </a>
                                                    {item.address === governor && (
                                                        <Tooltip content="* (Actual Boss Governor) Deployer starts with 110 point.">
                                                            <span className="text-yellow-400">*</span>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            ) : (
                                                item.contribution / 10000
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
