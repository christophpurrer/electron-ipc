import { loadAndWrapAddon, Addon, SystemInfo } from "../shared/addon";
import { AddonService } from "../shared/addonService";
import { AddonServiceChannels } from "../shared/addonServiceChannels";
import { registerIpcChannels } from "../shared/ipcUtils";

export class AddonServiceMain implements AddonService {
  addon: Addon;
  userId: string | null = null;
  constructor() {
    console.log("addonService constructor ...");
    this.addon = loadAndWrapAddon();
    registerIpcChannels(this, "AddonService", AddonServiceChannels);
  }
  getSystemInfo(threadId: number, feature: string): Promise<SystemInfo> {
    return this.addon.getSystemInfo(threadId, feature);
  }
  setUser(userId: string | null): Promise<void> {
    if (userId) {
      this.userId = userId;
      return Promise.resolve();
    }
    return Promise.reject(new Error("userId missing"));
  }
  setUserSync(userId: string | null): void {
    if (userId) {
      this.userId = userId;
    }
    throw new Error("userId missing");
  }
  doSomethingSync(): number {
    return new Date().getTime();
  }
  doSomethingElseSync(): void {}
}
