import { ipcMain, ipcRenderer, IpcMainEvent } from "electron";

export type Scope = "AddonService";

export type IpcChannel = {
  name: string;
  isSync?: boolean;
};

function getChannelNames(channels: Array<IpcChannel>): Array<string> {
  return channels.map((c) => c.name);
}

function getSyncChannelNames(channels: Array<IpcChannel>): Array<string> {
  return channels.filter((c) => c.isSync).map((c) => c.name);
}

function getIpcChannelName(scope: Scope, method: string): string {
  return scope + "_" + method;
}

type IpcError = {
  __ipcError: string;
};

function serializeError(e: Error): IpcError {
  // Serialize error https://stackoverflow.com/a/18391400
  const keys = {};
  // @ts-ignore. Typescript can't verify the object
  Object.getOwnPropertyNames(e).forEach((key) => (keys[key] = e[key]), e);
  return { __ipcError: JSON.stringify(keys) };
}

function deserializeError(error: string | null): Error | null {
  return error ? JSON.parse(error) : null;
}

export function createIpcClient<T>(
  obj: object,
  scope: Scope,
  channels: Array<IpcChannel>
): T {
  channels.forEach((channel) => {
    const channelName = getIpcChannelName(scope, channel.name);
    const syncMethods = getSyncChannelNames(channels);
    if (syncMethods.indexOf(channel.name) >= 0) {
      // @ts-ignore. Typescript can't verify the object
      obj[channel.name] = (...args: any) => {
        const result = ipcRenderer.sendSync(channelName, [...args]);
        if (result && typeof result === "object" && result.__ipcError) {
          throw deserializeError(result.__ipcError);
        }
        return result;
      };
    } else {
      // @ts-ignore. Typescript can't verify the object
      obj[channel.name] = async (...args: any) => {
        const result = await ipcRenderer.invoke(channelName, [...args]);
        if (result && typeof result === "object" && result.__ipcError) {
          throw deserializeError(result.__ipcError);
        }
        return result;
      };
    }
  });
  // @ts-ignore. Typescript can't verify the object
  return Object.freeze(obj);
}

export function registerIpcChannels(
  obj: object,
  scope: Scope,
  channels: Array<IpcChannel>
) {
  const channelNames = getChannelNames(channels);
  const syncMethods = getSyncChannelNames(channels);
  const methods = Object.getOwnPropertyNames(obj)
    .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)))
    .filter((method) => channelNames.indexOf(method) >= 0)
    .filter(
      (method) =>
        (obj as any)[method] !== undefined &&
        typeof (obj as any)[method] === "function"
    )
    .sort();
  if (methods.length != channels.length) {
    throw new Error(
      "Unable to registerIpcChannels. Invalid object or channels array provided!"
    );
  }
  methods.forEach((method: string) => {
    const channelName = getIpcChannelName(scope, method);
    console.info(`Register ${channelName} method on ipcMain`);
    const f = (obj as any)[method];
    if (syncMethods.indexOf(method) >= 0) {
      ipcMain.on(channelName, (event: IpcMainEvent, args: any) => {
        console.info(`#icpMain::${channelName}()`);
        try {
          event.returnValue = f.call(obj, ...args);
        } catch (e) {
          console.info(
            `#icpMain::${channelName}() called async(), but is sync()`
          );
          event.returnValue = serializeError(e);
        }
      });
    } else {
      ipcMain.handle(channelName, (_event: any, args: any) => {
        console.info(`#icpMain::${channelName}()`);
        let error = null;
        let result = null;
        try {
          result = f
            .call(obj, ...args)
            .catch((e: Error) => (error = serializeError(e)));
        } catch (e) {
          console.info(
            `#icpMain::${channelName}() called async(), but is sync()`
          );
          error = serializeError(e);
        }
        return error ? error : result;
      });
    }
  });
}
