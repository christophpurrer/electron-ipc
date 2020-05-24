import { IpcMainInvokeEvent } from "electron";
import { loadAndWrapAddon, Addon, SystemInfo } from "../shared/addon";
import { AddonService } from "../shared/addonService";
import { IpcMain } from "electron";

export class AddonServiceMain implements AddonService {
  ipcMain: IpcMain;
  addon: Addon;
  userId: string | null = null;
  constructor(ipcMain: IpcMain) {
    console.log("addonService constructor ...");
    this.ipcMain = ipcMain;
    this.addon = loadAndWrapAddon();
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter(
      (method) =>
        method &&
        method !== "constructor" &&
        (this as any)[method] !== undefined &&
        typeof (this as any)[method] === "function"
    );
    methods.forEach((method: string) => {
      console.log(`addonService register: ${method}(...) on ipcMain`);
      this.ipcMain.handle(
        method,
        async (_event: IpcMainInvokeEvent, args: any) => {
          const f = (this as any)[method];
          return f.call(this, ...args);
        }
      );
    });
  }
  getSystemInfo(threadId: number, feature: string): Promise<SystemInfo> {
    return this.addon.getSystemInfo(threadId, feature);
  }
  setUser(userId: string): Promise<void> {
    this.userId = userId;
    return Promise.resolve();
  }
}
