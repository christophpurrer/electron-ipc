import { IpcChannel } from "./ipcUtils";

export const AddonServiceChannels: Array<IpcChannel> = [
  { name: "getSystemInfo" },
  { name: "setUser" },
  { name: "setUserSync", isSync: true },
  { name: "doSomethingSync", isSync: true },
  { name: "doSomethingElseSync", isSync: true },
];
