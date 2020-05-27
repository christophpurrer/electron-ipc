import { loadAndWrapAddon, Addon, SystemInfo } from "../shared/addon";
import { AddonService } from "../shared/addonService";
import { IpcMain } from "electron";
import { registerIpcChannels, IpcService } from "../shared/ipcUtils";

export class AddonServiceMain implements AddonService, IpcService {
  ipcMain: IpcMain;
  addon: Addon;
  userId: string | null = null;
  constructor(ipcMain: IpcMain) {
    console.log("addonService constructor ...");
    this.ipcMain = ipcMain;
    this.addon = loadAndWrapAddon();
    registerIpcChannels(this);
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
