import { app, BrowserWindow } from "electron";

class Main {
  private mainWindow: BrowserWindow;

  public init() {
    app.on("ready", this.createWindow);
    app.on("window-all-closed", this.onWindowAllClosed);
    app.on("activate", this.onActivate);
  }

  private onWindowAllClosed() {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onActivate() {
    if (!this.mainWindow) {
      this.createWindow();
    }
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      title: `Yet another Electron Application`,
      webPreferences: {
        nodeIntegration: true, // makes it possible to use `require` within our index.html
      },
    });

    // this.mainWindow.webContents.openDevTools();
    this.mainWindow.loadFile("../../index.html");
  }
}

const main = new Main();
main.init();
module.exports=main;
