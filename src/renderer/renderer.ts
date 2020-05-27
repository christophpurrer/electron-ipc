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

// a simple IPC example
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

// make n calls to get a sense of performance
const makeNCalls = document.getElementById("make-n-calls");
const nCalls = 500;
makeNCalls!.innerText = `Make ${nCalls} IPC requests`;
const nCallsResult = document.getElementById("n-calls-result");
makeNCalls!.addEventListener("click", async () => {
  const now = new Date().getTime();
  for (let i = 0; i < nCalls; i++) {
    await service.getSystemInfo(i, "kernel");
  }
  nCallsResult!.innerHTML = `${nCalls} IPC invoke calls took ${
    new Date().getTime() - now
  } ms`;
});

// show current time to ensure render process is not blocked
const time = document.getElementById("time");
time!.innerHTML = new Date().toLocaleTimeString();
window.setInterval(
  () => (time!.innerHTML = new Date().toLocaleTimeString()),
  1000
);
