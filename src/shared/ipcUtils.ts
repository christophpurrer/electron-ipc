export type Scope = "AddonService";

export type IpcChannel = {
  scope: Scope;
  method: string;
  isSync: boolean;
};

export function getIpcChannelName(scope: Scope, method: string): string {
  return scope + "_" + method;
}

export function channelRegistry(): string {
  return "ALL_CHANNELS";
}
