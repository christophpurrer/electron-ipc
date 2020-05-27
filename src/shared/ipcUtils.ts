import { IpcMain } from "electron";

export type IpcService = {
  ipcMain: IpcMain;
};

export function registerIpcChannels(obj: IpcService) {
  // get object methods
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
    (method) =>
      method &&
      method !== "constructor" &&
      (obj as any)[method] !== undefined &&
      typeof (obj as any)[method] === "function"
  );
  // register object methods to respond to ipc requests
  methods.forEach((method: string) => {
    console.log(`addonService register: ${method}(...) on ipcMain`);
    obj.ipcMain.handle(method, async (_event: any, args: any) => {
      const f = (obj as any)[method];
      return f.call(obj, ...args).catch((e: Error) => console.error(e));
    });
  });
}
