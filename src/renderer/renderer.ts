// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import { AddonService } from "../shared/addonService";
import { SystemInfo } from "../shared/addon";
import { IpcRenderer } from "electron";

class AddonServiceRender implements AddonService {
  ipcRenderer: IpcRenderer;
  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRenderer = ipcRenderer;
  }

  getSystemInfo(threadId: number, feature: string): Promise<SystemInfo> {
    return this.ipcRenderer.invoke("getSystemInfo", [threadId, feature]);
  }

  setUser(userId: string): Promise<void> {
    return Promise.resolve();
  }
}

const service = new AddonServiceRender(window.bridge.ipcRenderer);
document
  .getElementById("request-os-info")!
  .addEventListener("click", async () => {
    const result = await service.getSystemInfo(1, "kernel");
    document.getElementById("os-info")!.innerHTML =
      result.threadId + ": " + result.feature + " > " + result.kernel;
  });
