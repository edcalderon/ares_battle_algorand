import { useEffect, useState } from 'react';
import { getAppInfo } from '@/lib/getAppsFromAddress';

const useAppInfo = (appId: bigint) => {
    const [createdApps, setCreatedApps] = useState<any>();
    const [loadingCreatedApps, setLoadingCreatedApps] = useState<boolean>(false);

    useEffect(() => {
        setLoadingCreatedApps(true);
        const getAccountInfo = async () => {
            if (!appId) {
                setLoadingCreatedApps(false);
                throw new Error('No selected appId.');
            }
            const accountInfo = await getAppInfo(appId);
            setCreatedApps(accountInfo);
            setLoadingCreatedApps(false);
            return accountInfo;
        };

        getAccountInfo().catch((error) => {
            console.error(error);
            setLoadingCreatedApps(false);
        });

    }, [appId]);

    return { createdApps, loadingCreatedApps };
};

export default useAppInfo;