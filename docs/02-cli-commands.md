# CLI Commands and Interactive Flow

`fcode` has exactly two commands, distinguished by a flag:

```bash
fcode                          # generate files from a template (default mode)
fcode --create-template        # scaffold a new template
fcode --crt                    # short alias for --create-template
```

The flag is determined in `src/index.ts` via
`hasFlag(args, "--create-template", "--crt")`. Any other arguments are
ignored — there's no dedicated option parser (no `--help`, `--version`, etc.).

---

## Mode 1: generate from a template (default)

Implementation: `src/generate-from-template/generate-from-template.ts`.

Steps run strictly in sequence:

1. **Load config** — `loadConfig(root)` reads `fcode.config.json` from the
   process's current working directory. If the file is missing or
   `template_naming_style` isn't set, the CLI throws and exits with code 1
   (see `src/cli.ts`: the error is printed via `console.error`).
2. **Load `.fcode/` files** — `loadFcodeFiles(root)` reads all files that live
   directly inside `.fcode/` (not `.fcode/templates/`), and logs their count:
   `Loaded files from .fcode: N`. See the caveats in
   [07-gotchas-and-internals.md](./07-gotchas-and-internals.md) — currently
   this is purely an informational step.
3. **Build the folder list** — `loadIgnore` + `walkDirs` recursively walk the
   project's directory tree from the root, excluding anything matched by
   `.gitignore` (plus `.git`, which is always excluded explicitly). The list
   contains directories only — files aren't included.
4. **"Destination folder" prompt** — `type: "autocomplete"` from `prompts`:
   you can type text to filter the list, but by default (`suggest`) the
   choice is limited to directories that actually exist and passed the
   `.gitignore` filter in step 3.
5. **Load the template list** — `loadTemplates(root)` reads the subfolders of
   `.fcode/templates/`. If the folder doesn't exist, a warning is printed and
   the process exits without creating anything (an empty list causes an early
   `return` in `runGenerateFromTemplate`).
6. **"Template" prompt** — `type: "select"`, the list is the subfolder names
   from step 5.
7. **Load the template's props** — `loadProps(templateDir)` reads
   `_props.json` from the root of the selected template. If the file is
   missing or fails to parse, there will be no props beyond `name`.
8. **"Name" prompt** — a text question, always asked, regardless of
   `_props.json`. The value is stored as `PROPS.name`.
9. **Prompts for remaining props** — one text question per key in
   `_props.json`, using `label` as the question text (or the key name if
   `label` isn't set).
10. **"Create a new folder?" prompt** — `type: "confirm"`, defaults to `No`.
11. **Determining the destination directory**:
    - if the answer is "Yes" — `<path>/<name, formatted per
      template_naming_style>`;
    - if "No" — just `<path>` from step 4.
12. **Copy the template** — `copyTemplate` recursively walks the template
    folder, skips `_props.json`, renders placeholders in both names and
    content of the remaining files/folders, and writes the result to the
    destination directory.
13. The console prints: `Template "<template>" copied to <destDir>`.

If the user cancels one of the key prompts (path/template — via Ctrl+C or Esc
in `prompts`, which returns `undefined`), execution stops early (`return`)
without an error and without side effects.

## Mode 2: scaffold a template (`--create-template` / `--crt`)

Implementation: `src/create-template/create-template.ts`.

1. **"Template name" prompt** — a plain text question.
2. If nothing is entered (empty/cancelled) — quiet exit, no error.
3. The template folder name = `kebabcase(name)` (this formatter is always
   applied, regardless of `template_naming_style` in the config — the config
   isn't even read here).
4. `.fcode/templates/<kebab-name>/` is created (recursively, if parent
   folders didn't exist).
5. An empty `_props.json` is created inside, with content `{}\n`.
6. The console prints: `Template "<kebab-name>" created at <templateDir>`.

The rest of the template's files and subfolders (the actual content with
placeholders) need to be added manually — this command only scaffolds the
folder and an empty props file. See
[04-template-anatomy.md](./04-template-anatomy.md) for how to fill it in.

> Note: `--create-template` does **not** read `fcode.config.json`, so it can
> be used even in a project where the config hasn't been created yet.
