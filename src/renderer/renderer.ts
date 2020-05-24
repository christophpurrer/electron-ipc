// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import { AddonService } from "../shared/addonService";
import { IpcRenderer } from "electron";

function createAddonServiceRender(ipcRenderer: IpcRenderer): AddonService {
  return {
    getSystemInfo: (...args) => ipcRenderer.invoke("getSystemInfo", [...args]),
    setUser: (...args) => ipcRenderer.invoke("setUser", [...args]),
  };
}

const service: AddonService = createAddonServiceRender(
  window.bridge.ipcRenderer
);
const requestOSInfo = document.getElementById("request-os-info");
requestOSInfo!.addEventListener("click", async () => {
  // await service.setUser("4");
  const systemInfo = await service.getSystemInfo(1, "kernel");
  const osInfo = document.getElementById("os-info");
  osInfo!.innerHTML =
    systemInfo.threadId + ": " + systemInfo.feature + " > " + systemInfo.kernel;
});
