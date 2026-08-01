import { join } from "node:path";
import { loadConfig } from "../shared/config.ts";
import { loadIgnore, walkDirs } from "../shared/directories.ts";
import { loadFcodeFiles } from "../shared/fcode-files.ts";
import { getFormatter } from "../shared/formatters.ts";
import {
  promptCreateFolder,
  promptDestinationPath,
  promptName,
  promptPropValues,
  promptTemplate,
} from "./prompts.ts";
import { copyTemplate, getTemplateDir, loadProps, loadTemplates } from "./templates.ts";

function resolveFolderName(namingStyle: string, name: string): string {
  const formatter = getFormatter(namingStyle);
  if (!formatter) {
    throw new Error(`Unknown template_naming_style: ${namingStyle}`);
  }
  return formatter(name);
}

export async function runGenerateFromTemplate(root: string): Promise<void> {
  const config = await loadConfig(root);
  await loadFcodeFiles(root);

  const ig = await loadIgnore(root, config);
  const dirs = await walkDirs(root, ig);

  const path = await promptDestinationPath(dirs);
  if (!path) return;

  const templates = await loadTemplates(root);
  if (templates.length === 0) return;

  const template = await promptTemplate(templates);
  if (!template) return;

  const templateDir = getTemplateDir(root, template);
  const props = await loadProps(templateDir);

  const name = await promptName();
  const values = await promptPropValues(props);
  values.name = name;

  const createFolder = await promptCreateFolder();

  const destDir = createFolder
    ? join(root, path, resolveFolderName(config.template_naming_style, name))
    : join(root, path);

  await copyTemplate(templateDir, destDir, values);

  console.log(`Template "${template}" copied to ${destDir}`);
}
