import { useEffect, useState } from 'react';
import { decodeGlobalState } from '@/lib/decodeGlobalState';
import { Contributor, Boss } from '@/types';

export const useDecodedBosses = (createdApps: any[]) => {
    const [createdBosses, setCreatedBosses] = useState<Boss[]>([]);

    useEffect(() => {
        const decodedAppsFormatedToBoss: Boss[] = createdApps.map(app => {
            const decodedState = decodeGlobalState(app.params.globalState as any).decodedStates;

            const boss: Boss = {
                id: app.id,
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
                contributors: decodedState && decodedState.length > 0
                    ? decodedState.find(state => state.key === 'numStakers')?.value
                    : 'Unknown',
                topAccounts: decodedState && decodedState.length > 0
                    ? [
                        decodedState.find(state => state.key === 't1')?.value,
                        decodedState.find(state => state.key === 't2')?.value,
                        decodedState.find(state => state.key === 't3')?.value
                      ].filter(Boolean)
                    : [],
            };

            return boss;
        });
        setCreatedBosses(decodedAppsFormatedToBoss);
    }, [createdApps]);

    return createdBosses;
} 