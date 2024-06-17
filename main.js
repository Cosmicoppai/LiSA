const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const isDevMode = require('electron-is-dev');
const path = require('path');

let pythonServer;

function startPythonServer() {
    if (isDevMode) {
        pythonServer = spawn('python backend/LiSA.py', {
            detached: true,
            shell: true,
        });
    } else {
        const linux = `${path.join(app.getAppPath()?.replace(/\/app$/, ''), 'resources/lisa', 'LiSA')}`;
        // Dynamic script assignment for starting Python in production
        const runPython = {
            darwin: linux,
            linux,
            win32: `powershell -Command Start-Process -WindowStyle Hidden "./resources/LiSA/LiSA.exe"`,
        }[process.platform];

        pythonServer = spawn(`${runPython}`, {
            shell: true,
        });
    }
}

function killPythonServer() {
    if (!pythonServer) return;

    if (process.platform === 'win32') spawn('taskkill', ['/PID', pythonServer.pid, '/F', '/T']);
    else pythonServer.kill('SIGINT');

    console.log('Killed python server, PID: ', pythonServer.pid);

    pythonServer = null;
}

/**
 * @namespace BrowserWindow
 * @description - Electron browser windows.
 */
const browserWindows = {};

/**
 * @description - Creates main window.
 * @param {number} port - Port that Python server is running on.
 *
 * @memberof BrowserWindow
 */
const createMainWindow = () => {
    const { loadingWindow, mainWindow } = browserWindows;

    /**
     * @description - Function to use custom JavaSCript in the DOM.
     * @param {string} command - JavaScript to execute in DOM.
     * @param {function} callback - Callback to execute here once complete.
     * @returns {Promise}
     */
    const executeOnWindow = (command, callback) => {
        return mainWindow.webContents
            .executeJavaScript(command)
            .then(callback)
            .catch(console.error);
    };

    /**
     * If in developer mode, show a loading window while
     * the app and developer server compile.
     */
    const isPageLoaded = `
   var isBodyFull = document.body.innerHTML !== "";
   var isHeadFull = document.head.innerHTML !== "";
   var isLoadSuccess = isBodyFull && isHeadFull;

   isLoadSuccess || Boolean(location.reload());
 `;

    /**
     * @description Updates windows if page is loaded
     * @param {*} isLoaded
     */
    const handleLoad = (isLoaded) => {
        if (isLoaded) {
            /**
             * Keep show() & hide() in this order to prevent
             * unresponsive behavior during page load.
             */

            mainWindow.show();
            mainWindow.maximize();
            loadingWindow.hide();
            loadingWindow.close();
        }
    };

    /**
     * Checks if the page has been populated with
     * React project. if so, shows the main page.
     */
    // executeOnWindow(isPageLoaded, handleLoad);

    if (isDevMode) {
        mainWindow.loadURL('http://localhost:5173');

        mainWindow.hide();

        /**
         * Hide loading window and show main window
         * once the main window is ready.
         */
        mainWindow.webContents.on('did-finish-load', () => {
            /**
             * Checks page for errors that may have occurred
             * during the hot-loading process.
             */
            // mainWindow.webContents.openDevTools({ mode: "undocked" });

            /**
             * Checks if the page has been populated with
             * React project. if so, shows the main page.
             */
            executeOnWindow(isPageLoaded, handleLoad);
        });
    } else {
        mainWindow.hide();

        mainWindow.removeMenu(true);

        mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
        // mainWindow.webContents.openDevTools({ mode: "undocked" });

        mainWindow.webContents.on('did-finish-load', () => {
            executeOnWindow(isPageLoaded, handleLoad);
        });
    }
};

/**
 * @description - Creates loading window to show while build is created.
 * @memberof BrowserWindow
 */
const createLoadingWindow = () => {
    return new Promise((resolve, reject) => {
        const { loadingWindow } = browserWindows;

        // Variants of developer loading screen
        const loaderConfig = {
            main: 'public/loader.html',
        };

        try {
            loadingWindow.loadFile(path.join(__dirname, loaderConfig.main));
            loadingWindow.removeMenu(true);

            loadingWindow.webContents.on('did-finish-load', () => {
                loadingWindow.show();
                resolve();
            });
        } catch (error) {
            console.error(error);
            reject();
        }
    });
};

app.whenReady().then(async () => {
    /**
     * Method to set port in range of 3001-3999,
     * based on availability.
     */

    /**
     * Assigns the main browser window on the
     * browserWindows object.
     */
    browserWindows.mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: true,
            autoHideMenuBar: true,
            show: false,
            nodeIntegration: true,
            preload: path.join(isDevMode ? __dirname : app.getAppPath(), 'preload.js'),
        },
    });

    /**
     * If not using in production, use the loading window
     */
    if (isDevMode) {
        // await installExtensions(); // React, Redux devTools
        browserWindows.loadingWindow = new BrowserWindow({
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            width: 300,
            height: 300,
        });
        createLoadingWindow().then(() => createMainWindow());
    } else {
        /**
         * If using in production, use the main window
         * and run bundled app (dmg, elf, or exe) file.
         */
        browserWindows.loadingWindow = new BrowserWindow({
            frame: false,
            transparent: true,
            alwaysOnTop: true,
        });
        createLoadingWindow().then(() => {
            createMainWindow();
        });
    }
    startPythonServer();

    app.on('activate', () => {
        /**
         * On macOS it's common to re-create a window in the app when the
         * dock icon is clicked and there are no other windows open.
         */
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });

    /**
     * Ensures that only a single instance of the app
     * can run, this correlates with the "name" property
     * used in `package.json`.
     */
    const initialInstance = app.requestSingleInstanceLock();
    if (!initialInstance) app.quit();
    else {
        app.on('second-instance', () => {
            if (browserWindows.mainWindow?.isMinimized()) browserWindows.mainWindow?.restore();
            browserWindows.mainWindow?.focus();
        });
    }

    /**
     * Quit when all windows are closed, except on macOS. There, it's common
     * for applications and their menu bar to stay active until the user quits
     * explicitly with Cmd + Q.
     */

    app.on('window-all-closed', () => {
        console.log('all windows closed.');
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('quit', function () {
        // Clean up the Python server when the app quits
        killPythonServer();
    });
});

const puppeteer = require('puppeteer');

// IPC handler to respond to messages from the renderer process
ipcMain.handle('getDomainCookies', async (event, args) => {
    try {
        // TODO: auto remove this log statements while building
        console.log('Getting cookies');
        // Prepare data to send to the renderer process

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set User-Agent and other headers if necessary
        await page.setUserAgent(args.data.user_agent);

        // Go to the website
        await page.goto(args.data.site_url ?? 'https://animepahe.ru', {
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
