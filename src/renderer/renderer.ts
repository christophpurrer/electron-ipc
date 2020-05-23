// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const requestOSInfo = document.getElementById("request-os-info");
const osInfo = document.getElementById("os-info");
if (requestOSInfo && osInfo) {
  requestOSInfo.addEventListener("click", async () => {
    const result = await window.bridge.ipcRenderer.invoke("system-info", null);
    osInfo.innerHTML = result.kernel;
  });
}
