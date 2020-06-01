// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import { AddonService } from "../shared/addonService";
import { loadAndWrapAddon, Addon } from "../shared/addon";
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
    // @ts-ignore
    const rejectedPromise = await service.setUser(null).catch((e: Error) => {
      console.error(e);
    });
    // call something sync
    const value = service.doSomethingSync();
    service.doSomethingElseSync();
    // make another ipc.invoke() request
    const threadId = Math.floor(Math.random() * 10000);
    const systemInfo = await service.getSystemInfo(threadId, "kernel");
    osInfo!.innerHTML =
      `<b>value:</b> ${value} <br/>` +
      `<b>processId:</b> ${systemInfo.processId} <br/>` +
      `<b>threadId:</b> ${systemInfo.threadId} <br/>` +
      `<b>feature:</b> ${systemInfo.feature} <br/> ` +
      `<b>kernel:</b> ${systemInfo.kernel} <br/> ` +
      `<b>time:</b> ${systemInfo.time} <br/> ` +
      `<b>data:</b> ${systemInfo.data} <br/> ` +
      `<b>moreData:</b> ${systemInfo.moreData}`;
  });
}

function processResult(systemInfo: SystemInfo): boolean {
  const string =
    systemInfo.processId +
    systemInfo.feature +
    systemInfo.kernel +
    systemInfo.threadId +
    systemInfo.time +
    systemInfo.data.join("") +
    systemInfo.moreData.join("");
  if (string) {
    return true;
  }
  return false;
}

function addonCallsHelper(
  addon: Addon | AddonService,
  type: string,
  button: HTMLElement | null,
  result: HTMLElement | null
) {
  const nCalls = 500;
  button!.innerText = `Make ${nCalls} ${type}`;
  button!.addEventListener("click", async () => {
    result!.innerHTML = "Loading ...";
    const now = new Date().getTime();
    for (let i = 0; i < nCalls; i++) {
      const result = await addon.getSystemInfo(i, "kernel");
      processResult(result);
    }
    result!.innerHTML = `${nCalls} calls took ${new Date().getTime() - now} ms`;
  });
}

// make n IPC requests to get a sense of performance
{
  const button = document.getElementById("make-n-ipc-requests");
  const result = document.getElementById("make-n-ipc-requests-result");
  addonCallsHelper(service, "IPC requests", button, result);
}

// make n remote-modoule calls to get a sense of performance
{
  const addon = require("electron").remote.require("./main").addon;
  const button = document.getElementById("make-n-remote-module-calls");
  const result = document.getElementById("make-n-remote-module-calls-result");
  addonCallsHelper(addon, "remote.module calls", button, result);
}

// make n addon calls in the render process to get a sense of performance
{
  const addon = loadAndWrapAddon();
  const button = document.getElementById("make-n-render-module-calls");
  const result = document.getElementById("make-n-render-module-calls-result");
  addonCallsHelper(addon, "render.module calls", button, result);
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
