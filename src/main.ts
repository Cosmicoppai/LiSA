import { app, BrowserWindow } from 'electron';
import isSquirrelStartup from 'electron-squirrel-startup';
import path from 'path';

import './electron-main/ipcMainHandlers';
import { isViteDEV } from './constants/env';
import { killPythonServer, startPythonServer } from './electron-main/pythonServer';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (isSquirrelStartup) app.quit();

const loadingWindowFilePath = path.join(
    __dirname,
    isViteDEV ? '' : `../renderer/${MAIN_WINDOW_VITE_NAME}`,
    'loader.html',
);

async function createLoadingWindow() {
    const loadingWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        alwaysOnTop: true,
    });

    await loadingWindow.loadFile(loadingWindowFilePath);

    loadingWindow.removeMenu();

    loadingWindow.webContents.on('did-finish-load', () => {
        loadingWindow.show();
    });
    return { loadingWindow };
}

async function createMainWindow({ loadingWindow }: { loadingWindow: BrowserWindow }) {
    const mainWindow = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            // TODO: Make webSecurity true
            webSecurity: false,
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    else {
        mainWindow.removeMenu();
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
    });

    mainWindow.webContents.on('did-finish-load', () => {
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
                if (!loadingWindow?.isDestroyed()) loadingWindow?.close();
                mainWindow.show();
            }
        };

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
    return { mainWindow };
}

async function createWindows() {
    const { loadingWindow } = await createLoadingWindow();

    const { mainWindow } = await createMainWindow({ loadingWindow });

    return {
        loadingWindow,
        mainWindow,
    };
}

app.whenReady().then(async () => {
    startPythonServer();
    const { mainWindow } = await createWindows();

    /**
     * Ensures that only a single instance of the app
     * can run, this correlates with the "name" property
     * used in `package.json`.
     */
    const initialInstance = app.requestSingleInstanceLock();
    if (!initialInstance) app.quit();
    else {
        app.on('second-instance', () => {
            if (mainWindow?.isMinimized()) mainWindow?.restore();
            mainWindow?.focus();
        });
    }
});

app.on('activate', () => {
    /**
     * On macOS, it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     */
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
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
