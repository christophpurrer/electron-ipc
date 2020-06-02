import { IpcMain, IpcMainEvent } from "electron";
import {
  IpcChannel,
  getIpcChannelName,
  Scope,
  channelRegistry,
  IpcResult,
} from "../shared/ipcUtils";
import { getReturnType } from "../decorators/returnType";

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
    const f = (obj as any)[method];
    const isSync = getReturnType(obj, method) !== "Promise";
    if (isSync) {
      console.log(
        `Function ${method} should return a Promise to not block main and render thread`
      );
      ipcMain.on(channelName, (event: IpcMainEvent, args: any): void => {
        let error = null;
        let result = null;
        try {
          result = f.call(obj, ...args);
        } catch (e) {
          error = JSON.stringify(e, Object.getOwnPropertyNames(e));
        }
        event.returnValue = { result, error };
      });
    } else {
      ipcMain.handle(
        channelName,
        async (_event: any, args: any): Promise<IpcResult> => {
          let error = null;
          const result = await f.call(obj, ...args).catch(
            (e: Error) =>
              // Serialize error https://stackoverflow.com/a/26199752
              (error = JSON.stringify(e, Object.getOwnPropertyNames(e)))
          );
          return { result, error };
        }
      );
    }
    ipcChannels.push({ scope, method, isSync });
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
