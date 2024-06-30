export function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;

    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export function openFileExplorer(file_location: string) {
    if (!file_location || !window) return;
    window?.electronAPI?.showItemInFolder(file_location);
}

export function openExternalUrl(url: string) {
    if (!url || !window) return;
    window?.electronAPI?.openExternal(url);
}
