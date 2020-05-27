import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { AddonServiceMain } from "./addonServiceMain";
import { loadAndWrapAddon } from "../shared/addon";

let mainWindow: Electron.BrowserWindow | null;
let addonService: AddonServiceMain | null;
const addon = loadAndWrapAddon();

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 600,
    title: `Electron IPC`,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });

  mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    addonService = null;
    mainWindow = null;
  });

  addonService = new AddonServiceMain(ipcMain);
  if (!addonService) {
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

module.exports = {
  addon,
};
