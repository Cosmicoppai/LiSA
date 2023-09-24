const { shell } = window.require("electron");

export function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export function openFileExplorer(file_location) {
    // Show a folder in the file manager
    // Or a file
    // console.log(file_location);

    shell.showItemInFolder(file_location);
};