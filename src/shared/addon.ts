import { execSync } from "child_process";

export type SystemInfo = {
  processId: number;
  threadId: number;
  feature: string;
  kernel: string;
  time: number;
  data: Array<string>;
  moreData: Array<string>;
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
  const data = ["one", "two", "three"];
  const moreData = ["four", "five", "six"];
  return Object.freeze({
    key: "notification",
    anotherKey: anotherKey,
    getSystemInfo: async (threadId: number, feature: string) => {
      const kernel = execSync("uname -a").toString();
      const time = new Date().getTime();
      const processId = 1;
      return {
        processId,
        threadId,
        feature,
        kernel,
        time,
        data,
        moreData,
      };
    },
  });
}
