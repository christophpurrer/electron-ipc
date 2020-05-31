import { ipcRenderer } from "electron";
import {
  IpcChannel,
  getIpcChannelName,
  Scope,
  channelRegistry,
} from "../shared/ipcUtils";

export function createIpcClient<T>(
  obj: object,
  ipcChannels: Array<IpcChannel>
): T {
  const now = new Date().getTime();
  ipcChannels.forEach((ipcChannel) => {
    const channelName = getIpcChannelName(ipcChannel.scope, ipcChannel.method);
    // @ts-ignore. Typescript can't verify the object
    obj[ipcChannel.method] = (...args: any) =>
      ipcRenderer.invoke(channelName, [...args]);
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
