import { IpcMainInvokeEvent } from "electron";
import { loadAndWrapAddon, Addon, SystemInfo } from "../shared/addon";
import { AddonService } from "../shared/addonService";
import { IpcMain } from "electron";

function getAllMethodNames(obj: object): Array<string> {
  let methods = new Set<string>();
  while ((obj = Reflect.getPrototypeOf(obj))) {
    let keys = Reflect.ownKeys(obj);
    keys.forEach((k) => methods.add(k.toString()));
  }
  return Array.from(methods);
}

export class AddonServiceMain implements AddonService {
  ipcMain: IpcMain;
  addon: Addon;
  userId: string | null = null;
  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain;
    this.addon = loadAndWrapAddon();
    const methods = getAllMethodNames(this).filter(
      (method) => (this as any)[method] !== undefined
    );
    methods.forEach((method: string) => {
      console.log(`register: ${method} on ipcMain`);
      this.ipcMain.handle(
        method,
        async (_event: IpcMainInvokeEvent, args: any[]) => {
          const f = (this as any)[method];
          return f.call(this, method, args);
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
