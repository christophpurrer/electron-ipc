/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import { Project, MethodSignature } from "ts-morph";
import path from "path";
import fs from "fs";

export default function generateIpcChannels() {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });
  const typeFile = project.getSourceFile("addonService.ts");
  if (!typeFile) {
    throw new Error("addonService.ts missing");
  }
  const addonService = typeFile.getInterface("AddonService");
  if (!addonService) {
    throw new Error("AddonService interface missing");
  }
  const channels = addonService
    .getMethods()
    .map((m: MethodSignature) => {
      let result = '\n  { name: "' + m.getName() + '"';
      if (m.getReturnType().getSymbol()?.getName() === "Promise") {
        result += ", isSync: true";
      }
      result += " }";
      return result;
    })
    .sort();
  const output = `import { IpcChannel } from "./ipcUtils";

export const AddonServiceChannels: Array<IpcChannel> = [${channels.join(",")},
];`;
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "src/shared/addonServiceChannels.ts"),
    output,
    {
      encoding: "utf8",
    }
  );
}

generateIpcChannels();
