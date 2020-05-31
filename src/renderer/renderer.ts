// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import { AddonService } from "../shared/addonService";
import { SystemInfo } from "src/shared/addon";
import { createIpcClient, getIpcChannels } from "./ipcRendererUtils";

const channels = getIpcChannels("AddonService");
const service = createIpcClient<AddonService>({}, channels);

// a simple IPC example
{
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
}

function processResult(systemInfo: SystemInfo) {
  const string =
    systemInfo.feature +
    systemInfo.kernel +
    systemInfo.threadId +
    systemInfo.threadId;
  if (string) {
    return;
  }
}

const nCalls = 500;
// make n IPC requests to get a sense of performance
{
  const makeNIPCRequests = document.getElementById("make-n-ipc-requests");
  makeNIPCRequests!.innerText = `Make ${nCalls} IPC requests`;
  const nPCRequestsResult = document.getElementById("n-ipc-requests-result");
  makeNIPCRequests!.addEventListener("click", async () => {
    nPCRequestsResult!.innerHTML = "Loading ...";
    const now = new Date().getTime();
    for (let i = 0; i < nCalls; i++) {
      const result = await service.getSystemInfo(i, "kernel");
      processResult(result);
    }
    nPCRequestsResult!.innerHTML = `${nCalls} IPC invoke calls took ${
      new Date().getTime() - now
    } ms`;
  });
}

// make n remote-modoule calls to get a sense of performance
{
  const addon = require("electron").remote.require("./main").addon;
  const makeNRemoteModuleCalls = document.getElementById(
    "make-n-remote-module-calls"
  );
  makeNRemoteModuleCalls!.innerText = `Make ${nCalls} remote.module calls`;
  const nRemoteModuleCallsResult = document.getElementById(
    "make-n-remote-module-calls-result"
  );
  makeNRemoteModuleCalls!.addEventListener("click", async () => {
    nRemoteModuleCallsResult!.innerHTML = "Loading ...";
    const now = new Date().getTime();
    for (let i = 0; i < nCalls; i++) {
      const result = await addon.getSystemInfo(i, "kernel");
      processResult(result);
    }
    nRemoteModuleCallsResult!.innerHTML = `${nCalls} IPC invoke calls took ${
      new Date().getTime() - now
    } ms`;
  });
}

{
  // show current time to ensure render process is not blocked
  const time = document.getElementById("time");
  time!.innerHTML = new Date().toLocaleTimeString();
  window.setInterval(
    () => (time!.innerHTML = new Date().toLocaleTimeString()),
    1000
  );
}
