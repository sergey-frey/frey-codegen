import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_FILE } from "./constants.ts";

export interface FcodeConfig {
  template_naming_style: string;
}

export async function loadConfig(root: string): Promise<FcodeConfig> {
  let content: string;

  try {
    content = await readFile(join(root, CONFIG_FILE), "utf8");
  } catch {
    throw new Error(`File ${CONFIG_FILE} not found in ${root}`);
  }

  const config = JSON.parse(content) as Partial<FcodeConfig>;
  if (!config.template_naming_style) {
    throw new Error(`template_naming_style is not set in ${CONFIG_FILE}`);
  }

  return config as FcodeConfig;
}
