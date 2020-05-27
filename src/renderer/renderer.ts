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

const service = createAddonServiceRender(window.bridge.ipcRenderer);
const requestOSInfo = document.getElementById("request-os-info");
const osInfo = document.getElementById("os-info");
requestOSInfo!.addEventListener("click", async () => {
  osInfo!.innerHTML = "'";
  // set invalid value to test promise rejection
  await service.setUser(null);
  // make another ipc.invoke() request
  const threadId = Math.floor(Math.random() * 10000);
  const systemInfo = await service.getSystemInfo(threadId, "kernel");
  osInfo!.innerHTML =
    `<b>threadId:</b> ${systemInfo.threadId} <br/>` +
    `<b>feature:</b> ${systemInfo.feature} <br/> ` +
    `<b>time:</b> ${systemInfo.time} <br/> ` +
    `<b>kernel:</b> ${systemInfo.kernel}`;
});
