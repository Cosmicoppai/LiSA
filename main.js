const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const isDevMode = require('electron-is-dev');
const path = require('path');
const fs = require('fs');

let pythonServer;

function getPythonServerCMD() {
    if (isDevMode) return 'python backend/LiSA.py';

    switch (process.platform) {
        case 'win32':
            return `powershell -Command Start-Process -WindowStyle Hidden "./resources/LiSA/LiSA.exe"`;
        case 'linux':
        case 'darwin':
            return path.join(app.getAppPath().replace(/\/app$/, ''), 'resources/lisa', 'LiSA');
        default:
            // Unknown Platform.
            return null;
    }
}

function startPythonServer() {
    const cmd = getPythonServerCMD();
    if (!cmd) {
        console.error('Unsupported platform or failed to get the command to run python server.');
        return;
    }

    const logPath = path.join(path.dirname(process.execPath), 'LiSA.log');
    fs.writeFileSync(logPath, '', { encoding: 'utf8' });  // clear logs

    pythonServer = spawn(cmd, {
        shell: true,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    pythonServer.stdout.pipe(logStream);
    pythonServer.stderr.pipe(logStream);

    pythonServer.on('close', (_) => {
        logStream.end();
    });
}


function killPythonServer() {
    if (!pythonServer) return;

    if (process.platform === 'win32') {
        const killCmd = `tskill LiSA`;
        spawn('cmd.exe', ['/c', killCmd]);
    } else {
        const killCmd = 'pkill -f LiSA';
        spawn('sh', ['-c', killCmd]);
    }

    pythonServer = null;
}

/**
 * @namespace BrowserWindow
 * @description - Electron browser windows.
 */
const browserWindows = {};

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
             * Hide loading window and show main window
             * once the main window is ready.
             */
            loadingWindow.close();
            mainWindow.show();
        }
    };

    if (isDevMode) mainWindow.loadURL('http://localhost:5173');
    else {
        mainWindow.removeMenu(true);
        mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
    }

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
};

/**
 * @description - Creates loading window to show while build is created.
 * @memberof BrowserWindow
 */
const createLoadingWindow = () => {
    return new Promise((resolve, reject) => {
        const { loadingWindow } = browserWindows;

        try {
            loadingWindow.loadFile(path.join(__dirname, 'public/loader.html'));
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

function createWindow() {
    /**
     * Assigns the loading && main browser window on the
     * browserWindows object.
     */

    browserWindows.loadingWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        alwaysOnTop: true,
    });

    browserWindows.mainWindow = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(isDevMode ? __dirname : app.getAppPath(), 'preload.js'),
        },
    });

    browserWindows.mainWindow.once('ready-to-show', () => {
        browserWindows.mainWindow.maximize();
    });

    createLoadingWindow().then(() => {
        createMainWindow();
    });
}

app.whenReady().then(async () => {
    createWindow();
    startPythonServer();

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
});

app.on('activate', () => {
    /**
     * On macOS, it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     */
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/**
 * Quit when all windows are closed, except on macOS. There, it's common
 * for applications and their menu bar to stay active until the user quits
 * explicitly with Cmd + Q.
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('quit', (event) => {
    killPythonServer();
});

const puppeteer = require('puppeteer');

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
