export function sleep(milliseconds) {

    const date = Date.now();
    let currentDate = null;

    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export function openFileExplorer(file_location: string) {

    if (!file_location || !window.require) return;

    const { shell } = window.require("electron");
    shell.showItemInFolder(file_location);
};

export function openExternalUrl(link: string) {

    if (!link || !window.require) return;

    const { shell } = window.require("electron");
    shell.openExternal(link)
}