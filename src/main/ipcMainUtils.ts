import { IpcMain, IpcMainEvent } from "electron";
import {
  IpcChannel,
  getIpcChannelName,
  Scope,
  channelRegistry,
} from "../shared/ipcUtils";

export function registerIpcChannels(
  obj: object,
  ipcMain: IpcMain,
  scope: Scope
) {
  const now = new Date().getTime();
  // get all unique object methods
  const methods = Array.from(
    new Set(
      Object.getOwnPropertyNames(obj)
        .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)))
        .filter(
          (method) =>
            method &&
            method !== "constructor" &&
            (obj as any)[method] !== undefined &&
            typeof (obj as any)[method] === "function"
        )
    )
  );
  // register object methods to respond to ipc requests
  const ipcChannels: Array<IpcChannel> = [];
  methods.forEach((method: string) => {
    const channelName = getIpcChannelName(scope, method);
    ipcMain.handle(channelName, async (_event: any, args: any) => {
      const f = (obj as any)[method];
      return f.call(obj, ...args).catch((e: Error) => console.error(e));
    });
    ipcChannels.push({ scope, method });
  });
  // register all channels under a registry handle
  const channelRegistryName = getIpcChannelName(scope, channelRegistry());
  ipcMain.on(channelRegistryName, (event: IpcMainEvent, _args: any) => {
    event.returnValue = ipcChannels;
  });
  console.log(
    `Registered: ${ipcChannels.length} methods on ipcMain in ${
      new Date().getTime() - now
    }'ms under the scope: ${scope}`
  );
}
