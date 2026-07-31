import { formatters } from "./formatters.ts";

const PLACEHOLDER = /\[%\s*([^%]+?)\s*%\]/g;

function resolvePlaceholder(expr: string, props: Record<string, string>): string {
  const [pathExpr = "", ...formatterNames] = expr.split("|").map((part) => part.trim());
  const [namespace, key] = pathExpr.split(".");

  let value = "";

  if (namespace === "PROPS" && key) {
    value = props[key] ?? "";
  }

  for (const formatterName of formatterNames) {
    const formatter = formatters[formatterName.toLowerCase()];
    if (formatter) value = formatter(value);
  }

  return value;
}

export function renderTemplate(input: string, props: Record<string, string>): string {
  return input.replace(PLACEHOLDER, (_, expr: string) => resolvePlaceholder(expr, props));
}
