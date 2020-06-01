import { SystemInfo } from "./addon";

export interface AddonService {
  getSystemInfo(threadId: number, feature: string): Promise<SystemInfo>;
  setUser(userId: string | null): Promise<void>;
  doSomethingSync(): number;
  doSomethingElseSync(): void;
}
