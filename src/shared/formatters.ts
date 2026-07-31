export type Formatter = (value: string) => string;

function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean);
}

export const formatters: Record<string, Formatter> = {
  kebabcase: (value) =>
    splitWords(value)
      .map((w) => w.toLowerCase())
      .join("-"),
  snakecase: (value) =>
    splitWords(value)
      .map((w) => w.toLowerCase())
      .join("_"),
  camelcase: (value) =>
    splitWords(value)
      .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
      .join(""),
  pascalcase: (value) =>
    splitWords(value)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(""),
  uppercase: (value) => value.toUpperCase(),
  lowercase: (value) => value.toLowerCase(),
};

export function getFormatter(name: string): Formatter | undefined {
  return formatters[name.toLowerCase()];
}
