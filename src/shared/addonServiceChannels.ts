import { IpcChannel } from "./ipcUtils";

export const AddonServiceChannels: Array<IpcChannel> = [
  { name: "doSomethingElseSync" },
  { name: "doSomethingSync" },
  { name: "getSystemInfo", isSync: true },
  { name: "setUser", isSync: true },
  { name: "setUserSync" },
];