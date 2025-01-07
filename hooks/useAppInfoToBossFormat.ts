import { useEffect, useState } from 'react';
import { getAppInfo } from '@/lib/getAppsFromAddress';
import { decodeGlobalState } from '@/lib/decodeGlobalState';
import type { Boss, Contributor } from '@/types';

const useAppInfo = (appId: bigint) => {
    const [decodedBossInfo, setDecodedBossInfo] = useState<Boss>();
    const [loadingCreatedApps, setLoadingCreatedApps] = useState<boolean>(true);

    useEffect(() => {
        setLoadingCreatedApps(true);
        const getAccountInfo = async () => {
            if (!appId) {
                throw new Error('No selected appId.');
            }
            const accountInfo = await getAppInfo(appId);
            return accountInfo;
        };

        getAccountInfo().catch((error) => {
            console.error(error);
        }).then((info) => {
            if (!info) return;
            const decodedAppsFormatedToBoss = [info].map((app: any) => {
                const decodedState = decodeGlobalState(app.params.globalState as any).decodedStates;
                return {
                    id: parseInt(app.id),
                    name: decodedState && decodedState.length > 0
                        ? String(decodedState.find(state => state.key === 'n')?.value).replace(/[^a-zA-Z0-9]/g, '')
                        : 'Unknown',
                    health: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 'h')?.value
                        : 'Unknown',
                    maxHealth: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 'th')?.value
                        : 'Unknown',
                    governor: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 'g')?.value
                        : 'Unknown',
                    status: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 's')?.value
                        : 'Unknown',
                    pool: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 'p')?.value
                        : 'Unknown',
                    version: decodedState && decodedState.length > 0
                        ? decodedState.find(state => state.key === 'v')?.value
                        : 'Unknown',
                    contributors: decodedState ? decodedState
                        .filter(state => !['n', 'h', 'th', 'g', 's', 'p', 'v'].includes(state.key))
                        .map(state => ({ address: state.key, contribution: state.value })) as Contributor[] : []
                }
            })[0];
            setDecodedBossInfo(decodedAppsFormatedToBoss);
        }).finally(()=>{
            setLoadingCreatedApps(false);
        });

    }, [appId]);

    return { decodedBossInfo, loadingCreatedApps };
};

export default useAppInfo;