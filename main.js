const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { spawn, fork } = require("child_process");
const isDevMode = require("electron-is-dev");
const psTree = require("ps-tree");

/**
 * @namespace BrowserWindow
 * @description - Electron browser windows.
 */
const browserWindows = {};
let pids = [];

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
        mainWindow.loadURL("http://localhost:3000");

        mainWindow.hide();

        /**
         * Hide loading window and show main window
         * once the main window is ready.
         */
        mainWindow.webContents.on("did-finish-load", () => {
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

        mainWindow.loadFile(path.join(__dirname, "build/index.html"));
        // mainWindow.webContents.openDevTools({ mode: "undocked" });

        mainWindow.webContents.on("did-finish-load", () => {
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
            main: "public/loader.html",
        };

        try {
            loadingWindow.loadFile(path.join(__dirname, loaderConfig.main));
            loadingWindow.removeMenu(true);

            loadingWindow.webContents.on("did-finish-load", () => {
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
            preload: path.join(isDevMode ? __dirname : app.getAppPath(), "preload.js"),
        },
    });

    /**
     * If not using in production, use the loading window
     * and run Python in shell.
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
        // var devProc = spawn(`python backend/LiSA.py`, {
        //   detached: true,
        //   shell: true,
        //   stdio: "inherit",
        // });
        var devProc = spawn("python backend/LiSA.py", {
            detached: true,
            shell: true,
        });
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
        // Dynamic script assignment for starting Python in production
        const runPython = {
            darwin: `open -gj "${path.join(app.getAppPath(), "resources", "app.app")}" --args`,
            linux: "./resources/main/main",
            win32: `powershell -Command Start-Process -WindowStyle Hidden "./resources/LiSA/LiSA.exe"`,
        }[process.platform];

        var proc = spawn(`${runPython}`, {
            shell: true,
        });
    }

    app.on("activate", () => {
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
        app.on("second-instance", () => {
            if (browserWindows.mainWindow?.isMinimized()) browserWindows.mainWindow?.restore();
            browserWindows.mainWindow?.focus();
        });
    }

    /**
     * Quit when all windows are closed, except on macOS. There, it's common
     * for applications and their menu bar to stay active until the user quits
     * explicitly with Cmd + Q.
     */

    // app.on('before-quit', function() {
    //   pids.forEach(function(pid) {
    //     // A simple pid lookup
    //     ps.kill( pid, function( err ) {
    //         if (err) {
    //             throw new Error( err );
    //         }
    //         else {
    //             console.log( 'Process %s has been killed!', pid );
    //         }
    //     });
    //   });
    // });

    app.on("window-all-closed", () => {
        console.log("inside close");

        if (process.platform !== "darwin") {
            // console.log("killing");
            // console.log(devProc.pid);

            // // spawn(`powershell.exe -Command kill ${devProc.pid}`);

            // devProc.kill("SIGHUP");

            // psTree(devProc.pid, function (err, children) {
            //   console.log(err)
            //   console.log(children)
            //   devProc.spawn(
            //     "kill",
            //     ["-9"].concat(
            //       children.map(function (p) {
            //         console.log(`inside map child`)
            //         console.log(children)
            //         return p.PID;
            //       })
            //     )
            //   );
            // });

            spawn("taskkill /IM LiSA.exe /F", {
                shell: true,
                detached: true,
            });

            app.quit();
            console.log("after quit");
        }
    });
});

const puppeteer = require("puppeteer");

// IPC handler to respond to messages from the renderer process
ipcMain.handle("getDomainCookies", async (event, args) => {
    try {
        // Prepare data to send to the renderer process

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set User-Agent and other headers if necessary
        await page.setUserAgent(args.data.user_agent);

        // Go to the website
        await page.goto(args.data.site_url ?? "https://animepahe.ru", {
            waitUntil: "networkidle2",
        });

        // Wait for the challenge to be solved and the page to navigate
        await page.waitForNavigation({ waitUntil: "networkidle0" });

        // Get cookies after the challenge is solved
        const cookies = await page.cookies();

        await browser.close();

        return cookies;
    } catch (error) {
        return [];
    }
});
