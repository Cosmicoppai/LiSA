// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true as any;

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDomainCookies: async (data) => {
        return await ipcRenderer.invoke('getDomainCookies', data);
    },
    openExternal: (data) => ipcRenderer.invoke('open-external', data),
    showItemInFolder: (data) => ipcRenderer.invoke('show-item-in-folder', data),
    getPlatformOS: () => process.platform,
});
