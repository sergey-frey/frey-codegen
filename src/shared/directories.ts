import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, sep } from "node:path";
import ignore, { type Ignore } from "ignore";
import type { FcodeConfig } from "./config";

export async function loadIgnore(root: string, config: FcodeConfig): Promise<Ignore> {
  const ig = ignore().add(".git");

  const excludedFolders = config.exclude ?? [];

  for (const exclude of excludedFolders) {
    ig.add(exclude);
  }

  try {
    const content = await readFile(join(root, ".gitignore"), "utf8");
    ig.add(content);
  } catch {
    // no .gitignore in root
  }
  return ig;
}

export async function walkDirs(root: string, ig: Ignore): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string, relative: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const posixRel = relative ? `${relative}/${entry.name}` : entry.name;
      if (ig.ignores(posixRel)) continue;
      const rel = relative ? `${relative}${sep}${entry.name}` : entry.name;
      results.push(rel);
      await walk(join(dir, entry.name), posixRel);
    }
  }

  await walk(root, "");
  return results;
}
