import { useEffect, useState } from 'react';

export function openFileExplorer(file_location: string) {
    if (!file_location || !window) return;
    window?.electronAPI?.showItemInFolder(file_location);
}

export function openExternalUrl(url: string) {
    if (!url || !window) return;
    window?.electronAPI?.openExternal(url);
}

export async function PlatformOS(): Promise<NodeJS.Platform> {
    if (!window) return;
    return await window?.electronAPI?.getPlatformOS();
}

export const isViteDEV = import.meta.env.DEV;
export const isVitePROD = import.meta.env.PROD;

export function useFeatureAvailable() {
    const [isDownloadFeatureAvailable, setIsDownloadFeatureAvailable] = useState(true);

    useEffect(() => {
        (async () => {
            const platformOS = await PlatformOS();

            setIsDownloadFeatureAvailable(!(isVitePROD && platformOS === 'darwin'));
        })();
    }, []);

    return {
        isDownloadFeatureAvailable,
    };
}
