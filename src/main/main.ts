import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import * as path from "path";
import { loadAndWrapAddon, Addon } from "../shared/addon";

let mainWindow: Electron.BrowserWindow | null;
let addon: Addon;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 600,
    title: `Electron IPC`,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });

  mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  addon = loadAndWrapAddon();
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

// Main process
ipcMain.handle(
  "system-info",
  async (event: IpcMainInvokeEvent, args: any[]) => {
    console.log(`event: ${event}`);
    console.log(`args: ${args}`);
    return addon.getSystemInfo("abc");
  }
);
