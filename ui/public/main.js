const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

require("@electron/remote/main").initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: path.join(__dirname, "assests/loader_logo.png"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,

      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.setMenu(null) 

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }

  var splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadURL(
    isDev
      ? "http://localhost:3000/loader.html"
      : `file://${path.join(__dirname, "../build/loader.html")}`
  );
  splash.center();
  setTimeout(function () {
    splash.close();
    win.center();
    win.show();
  }, 5000);
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
