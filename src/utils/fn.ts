export function openFileExplorer(file_location: string) {
    if (!file_location || !window) return;
    window?.electronAPI?.showItemInFolder(file_location);
}

export function openExternalUrl(url: string) {
    if (!url || !window) return;
    window?.electronAPI?.openExternal(url);
}

export async function getPlatformOS(): Promise<NodeJS.Platform> {
    if (!window) return;
    return await window?.electronAPI?.getPlatformOS();
}
