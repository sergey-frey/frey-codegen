import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { FCODE_DIR } from "./constants.ts";

export async function loadFcodeFiles(root: string): Promise<Map<string, string>> {
  const dir = join(root, FCODE_DIR);
  const files = new Map<string, string>();

  let entries: Dirent[];

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.warn(`Folder ${FCODE_DIR} not found in ${root}`);
    return files;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    files.set(entry.name, await readFile(join(dir, entry.name), "utf8"));
  }

  console.log(`Loaded files from ${FCODE_DIR}: ${files.size}`);
  return files;
}
