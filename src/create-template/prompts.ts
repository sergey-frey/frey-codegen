import prompts from "prompts";

export async function promptTemplateName(): Promise<string> {
  const { name } = await prompts({
    type: "text",
    name: "name",
    message: "Template name",
  });

  return name;
}
