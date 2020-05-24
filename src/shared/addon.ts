import { execSync } from "child_process";

export type SystemInfo = {
  threadId: number;
  feature: string;
  kernel: string;
  time: number;
};

export type Addon = {
  key: string;
  anotherKey: Map<string, number>;
  getSystemInfo: (threadId: number, feature: string) => Promise<SystemInfo>;
};

export function loadAndWrapAddon(): Addon {
  const anotherKey = new Map<string, number>();
  anotherKey.set("one", 1);
  anotherKey.set("two", 2);
  return Object.freeze({
    key: "notification",
    anotherKey: anotherKey,
    getSystemInfo: async (threadId: number, feature: string) => {
      const kernel = execSync("uname -a").toString();
      const time = new Date().getTime();
      return {
        threadId,
        feature,
        kernel,
        time,
      };
    },
  });
}
