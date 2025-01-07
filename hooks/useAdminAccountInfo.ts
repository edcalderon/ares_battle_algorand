import { useEffect, useState } from 'react';
import { getAppsFromAddressByKey } from '@/lib/getAppsFromAddress';
import { ALGO_ADMIN, CONTRACT_VERSION } from '@/config/env';;

const useAdminAccountInfo = () => {
    const [createdApps, setCreatedApps] = useState<any[]>([]);
    const [loadingCreatedApps, setLoadingCreatedApps] = useState<boolean>(false);

    useEffect(() => {
        const getAccountInfo = async () => {
            setLoadingCreatedApps(true);
            const accountInfo = await getAppsFromAddressByKey(ALGO_ADMIN, { key: 'v', value: CONTRACT_VERSION });
            setCreatedApps(accountInfo);
            setLoadingCreatedApps(false);
            return accountInfo;
        };

        getAccountInfo().catch((error) => {
            console.error(error);
            setLoadingCreatedApps(false);
        });
    }, []);

    return { createdApps, loadingCreatedApps };
};

export default useAdminAccountInfo;