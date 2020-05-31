import { loadAndWrapAddon, Addon, SystemInfo } from "../shared/addon";
import { AddonService } from "../shared/addonService";
import { IpcMain } from "electron";
import { registerIpcChannels } from "./ipcMainUtils";

export class AddonServiceMain implements AddonService {
  ipcMain: IpcMain;
  addon: Addon;
  userId: string | null = null;
  constructor(ipcMain: IpcMain) {
    console.log("addonService constructor ...");
    this.ipcMain = ipcMain;
    this.addon = loadAndWrapAddon();
    registerIpcChannels(this, ipcMain, "AddonService");
  }
  getSystemInfo(threadId: number, feature: string): Promise<SystemInfo> {
    return this.addon.getSystemInfo(threadId, feature);
  }
  setUser(userId: string | null): Promise<void> {
    if (userId) {
      this.userId = userId;
      return Promise.resolve();
    }
    return Promise.reject();
  }
}
