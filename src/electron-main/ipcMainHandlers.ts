import { BrowserWindow, ipcMain, session, shell } from 'electron';

const yellowTxt = (str) => `\u001b[33m${str}\u001b[39m`;

// IPC handler to respond to messages from the renderer process
ipcMain.handle('get-domain-cookies', async (event, args) => {
    try {
        const siteURL = args.data.site_url || 'https://animepahe.ru';
        const userAgent = args.data.user_agent;

        console.log(
            'Cookies Generating:',
            '\nSite : ',
            yellowTxt(siteURL),
            '\nUserAgent: ',
            userAgent,
        );

        // To generate fresh cookies every time
        await session.defaultSession.clearStorageData();

        const cookieGenerationWindow = new BrowserWindow({
            show: false,
        });

        // await purpose - wait for the 'did-finish-load' event to complete.
        await cookieGenerationWindow.loadURL(siteURL, { userAgent });

        // No need for waitForNavigation as of now.

        // Query all cookies - We can add the siteURL to get cookies from it, but we don't need to.
        const cookies = await session.defaultSession.cookies.get({});

        cookieGenerationWindow.destroy();

        console.log('\nCookies generated\n', cookies);
        return cookies;
    } catch (error) {
        console.error('Domain Cookies Error', error);
        return [];
    }
});

// IPC handler to open external URLs
ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});
ipcMain.handle('show-item-in-folder', (event, file_location) => {
    shell.showItemInFolder(file_location);
});
