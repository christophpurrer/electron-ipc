import { ipcRenderer } from "electron";
import {
  IpcChannel,
  getIpcChannelName,
  Scope,
  channelRegistry,
  IpcResult,
} from "../shared/ipcUtils";

export function createIpcClient<T>(
  obj: object,
  ipcChannels: Array<IpcChannel>
): T {
  const now = new Date().getTime();
  ipcChannels.forEach((ipcChannel) => {
    const channelName = getIpcChannelName(ipcChannel.scope, ipcChannel.method);
    if (ipcChannel.isSync) {
      // @ts-ignore. Typescript can't verify the object
      obj[ipcChannel.method] = (...args: any) => {
        const result: IpcResult = ipcRenderer.sendSync(channelName, [...args]);
        if (result.error) {
          throw JSON.parse(result.error);
        }
        return result.result;
      };
    } else {
      // @ts-ignore. Typescript can't verify the object
      obj[ipcChannel.method] = async (...args: any) => {
        const result: IpcResult = await ipcRenderer.invoke(channelName, [
          ...args,
        ]);
        return result.error
          ? Promise.reject(JSON.parse(result.error))
          : Promise.resolve(result.result);
      };
    }
  });
  console.log(
    `Created ipcClient with : ${ipcChannels.length} channels in ${
      new Date().getTime() - now
    }'ms under the scope: ${ipcChannels[0].scope}`
  );

  // @ts-ignore. Typescript can't verify the object
  return Object.freeze(obj);
}

export function getIpcChannels(scope: Scope): Array<IpcChannel> {
  return ipcRenderer.sendSync(getIpcChannelName(scope, channelRegistry()));
}
