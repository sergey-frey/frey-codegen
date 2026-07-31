import type { Dirent } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FCODE_DIR, TEMPLATES_DIR } from "../shared/constants.ts";
import { renderTemplate } from "../shared/template-render.ts";

export interface PropField {
  label?: string;
}

export function getTemplateDir(root: string, template: string): string {
  return join(root, FCODE_DIR, TEMPLATES_DIR, template);
}

export async function loadTemplates(root: string): Promise<string[]> {
  const dir = join(root, FCODE_DIR, TEMPLATES_DIR);

  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.warn(`Folder ${FCODE_DIR}/${TEMPLATES_DIR} not found in ${root}`);
    return [];
  }

  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

export async function loadProps(templateDir: string): Promise<Record<string, PropField>> {
  try {
    const content = await readFile(join(templateDir, "_props.json"), "utf8");
    return JSON.parse(content) as Record<string, PropField>;
  } catch {
    return {};
  }
}

export async function copyTemplate(
  templateDir: string,
  destDir: string,
  props: Record<string, string>,
): Promise<void> {
  async function copy(srcDir: string, destDir: string): Promise<void> {
    await mkdir(destDir, { recursive: true });
    const entries = await readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "_props.json") continue;

      const destName = renderTemplate(entry.name, props);
      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, destName);

      if (entry.isDirectory()) {
        await copy(srcPath, destPath);
      } else if (entry.isFile()) {
        const content = await readFile(srcPath, "utf8");
        await writeFile(destPath, renderTemplate(content, props));
      }
    }
  }

  await copy(templateDir, destDir);
}
