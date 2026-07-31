# frey-codegen (fcode) Documentation

`fcode` is an interactive CLI generator for files and folders based on
templates. It substitutes values into file/folder names and file content
using a simple placeholder syntax: `[% PROPS.<name> | <formatter> %]`.

This folder is the full project documentation. A shorter version lives in
[`../README.md`](../README.md); this is the complete reference for every
feature.

## Sections

| Document | What's inside |
| --- | --- |
| [01-getting-started.md](./01-getting-started.md) | Install, run, first template in 2 minutes |
| [02-cli-commands.md](./02-cli-commands.md) | CLI commands (`fcode`, `--create-template` / `--crt`) and the full interactive flow |
| [03-configuration.md](./03-configuration.md) | `fcode.config.json`, `template_naming_style` |
| [04-template-anatomy.md](./04-template-anatomy.md) | Structure of `.fcode/templates/*`, `_props.json`, copy rules |
| [05-placeholders-and-formatters.md](./05-placeholders-and-formatters.md) | `[% ... %]` syntax, the `PROPS.name` prop, all formatters with examples |
| [06-examples.md](./06-examples.md) | Walkthroughs of real templates shipped in this repo: React component, simple file, multi-prop template, nested folders |
| [07-gotchas-and-internals.md](./07-gotchas-and-internals.md) | Behavior nuances, edge cases, internal implementation (for contributors) |

## What fcode does, in short

1. The project root has `fcode.config.json` (required) and a
   `.fcode/templates/` folder with templates.
2. The user runs `fcode` (or `npm start` inside frey-codegen itself).
3. The CLI asks: where to put the files, which template to use, prop values
   (including the required `name`), and whether to create a new subfolder.
4. The template is copied recursively to the destination: placeholders
   `[% PROPS.xxx | formatter %]` in file/folder names and content are
   replaced with formatted values.

## Feature map

- **Two CLI modes**: generating files from a template (default) and
  scaffolding a new template (`--create-template` / `--crt`).
- **Placeholders** in both file content AND file/folder names.
- **Formatter chains**: `[% PROPS.name | kebabcase | uppercase %]`.
- **6 built-in formatters**: `kebabcase`, `snakecase`, `camelcase`,
  `pascalcase`, `uppercase`, `lowercase` — case-insensitive by name.
- **Auto-populated `name` prop** — always available, even without a
  description in `_props.json`.
- **Arbitrary additional props** via `_props.json`, with custom question
  labels.
- **Destination folder selection with autocomplete**, the list is built from
  real project folders, respecting `.gitignore`.
- **Optional new subfolder creation**, named using the formatter configured
  as `template_naming_style`.
