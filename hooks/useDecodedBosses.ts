import { useEffect, useState } from 'react';
import { decodeGlobalState } from '@/lib/decodeGlobalState';
import { Contributor } from '@/types';

export const useDecodedBosses = (createdApps: any[]) => {
    const [createdBosses, setCreatedBosses] = useState<any[]>([]);

    useEffect(() => {
        const decodedAppsFormatedToBoss = createdApps.map(app => {
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
        });
        setCreatedBosses(decodedAppsFormatedToBoss);
    }, [createdApps]);

    return createdBosses;
} 