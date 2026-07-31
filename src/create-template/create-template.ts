import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FCODE_DIR, TEMPLATES_DIR } from "../shared/constants.ts";
import { formatters } from "../shared/formatters.ts";
import { promptTemplateName } from "./prompts.ts";

export async function runCreateTemplate(root: string): Promise<void> {
  const name = await promptTemplateName();
  if (!name) return;

  const folderName = formatters.kebabcase(name);
  const templateDir = join(root, FCODE_DIR, TEMPLATES_DIR, folderName);

  await mkdir(templateDir, { recursive: true });
  await writeFile(join(templateDir, "_props.json"), "{}\n");

  console.log(`Template "${folderName}" created at ${templateDir}`);
}
