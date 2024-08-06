import { useState, useEffect } from 'react';
import { isVitePROD } from 'src/constants/env';

import { getPlatformOS } from '../utils/fn';

export function useFeatureAvailable() {
    const [isDownloadFeatureAvailable, setIsDownloadFeatureAvailable] = useState(true);

    useEffect(() => {
        (async () => {
            const platformOS = await getPlatformOS();

            setIsDownloadFeatureAvailable(!(isVitePROD && platformOS === 'darwin'));
        })();
    }, []);

    return {
        isDownloadFeatureAvailable,
    };
}
