import { sep } from "node:path";
import prompts from "prompts";
import type { PropField } from "./templates.ts";

interface DirChoice {
  title: string;
  value: string;
}

function buildSuggest(choices: DirChoice[]) {
  return async (input: string): Promise<DirChoice[]> => {
    const term = input.toLowerCase();
    return choices.filter((choice) => choice.value.toLowerCase().includes(term));
  };
}

export async function promptDestinationPath(dirs: string[]): Promise<string | undefined> {
  const choices: DirChoice[] = dirs.map((dir) => {
    const value = dir + sep;
    return { title: value, value };
  });

  const { path } = await prompts({
    type: "autocomplete",
    name: "path",
    message: "Destination folder",
    choices,
    suggest: buildSuggest(choices),
  });

  return path;
}

export async function promptTemplate(templates: string[]): Promise<string | undefined> {
  const { template } = await prompts({
    type: "select",
    name: "template",
    message: "Template",
    choices: templates.map((name) => ({ title: name, value: name })),
  });

  return template;
}

export async function promptName(): Promise<string> {
  const { name } = await prompts({
    type: "text",
    name: "name",
    message: "Name",
  });

  return name;
}

export async function promptPropValues(
  props: Record<string, PropField>,
): Promise<Record<string, string>> {
  const values = await prompts(
    Object.entries(props).map(([propName, field]) => ({
      type: "text",
      name: propName,
      message: field.label ?? propName,
    })),
  );

  return values as Record<string, string>;
}

export async function promptCreateFolder(): Promise<boolean> {
  const { createFolder } = await prompts({
    type: "confirm",
    name: "createFolder",
    message: "Create a new folder?",
    initial: false,
  });

  return Boolean(createFolder);
}
