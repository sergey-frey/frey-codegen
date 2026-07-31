import { resolve } from "node:path";
import { runCreateTemplate } from "./create-template/index.ts";
import { runGenerateFromTemplate } from "./generate-from-template/index.ts";

function hasFlag(args: string[], ...flags: string[]): boolean {
  return args.some((arg) => flags.includes(arg));
}

export async function run(): Promise<void> {
  const root = resolve(process.cwd());
  const args = process.argv.slice(2);

  if (hasFlag(args, "--create-template", "--crt")) {
    await runCreateTemplate(root);
    return;
  }

  await runGenerateFromTemplate(root);
}
