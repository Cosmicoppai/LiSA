import { ipcMain, shell } from 'electron';
import puppeteer from 'puppeteer';

// IPC handler to respond to messages from the renderer process
ipcMain.handle('getDomainCookies', async (event, args) => {
    try {
        console.log('Getting cookies');
        // Prepare data to send to the renderer process

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set User-Agent and other headers if necessary
        await page.setUserAgent(args.data.user_agent);

        // Go to the website
        await page.goto(args.data.site_url || 'https://animepahe.ru', {
            waitUntil: 'networkidle2',
        });

        // Wait for the challenge to be solved and the page to navigate
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Get cookies after the challenge is solved
        const cookies = await page.cookies();
        console.log('Cookies generated');
        await browser.close();

        return cookies;
    } catch (error) {
        console.log('Domain Cookies Error', error);
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
