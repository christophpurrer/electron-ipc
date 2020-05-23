import { execSync } from "child_process";

export type SystemInfo = {
  kernel: string;
};

export type Addon = {
  key: string;
  anotherKey: Map<string, number>;
  getSystemInfo: (feature: string) => Promise<SystemInfo>;
};

export function loadAndWrapAddon(): Addon {
  const anotherKey = new Map<string, number>();
  anotherKey.set("one", 1);
  anotherKey.set("two", 2);
  return Object.freeze({
    key: "notification",
    anotherKey: anotherKey,
    getSystemInfo: async (feature: string) => {
      const result = execSync("uname -a").toString();
      return {
        kernel: result,
      };
    },
  });
}
