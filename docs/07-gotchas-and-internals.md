# Behavior Nuances and Internals

This section is for people actively writing templates or working on
frey-codegen itself. It collects non-obvious details of the current
implementation.

## The folder list is built from `.gitignore`

`loadIgnore`/`walkDirs` (`src/shared/directories.ts`) walk the project tree
from the root and exclude anything matched by the root `.gitignore`, plus
`.git`, which is always excluded explicitly. Practical consequence: **in the
frey-codegen repo itself, `.gitignore` contains the line `.fcode`**, so the
`.fcode` folder (and therefore `.fcode/templates`) never shows up in the
"Destination folder" selection list — but that doesn't affect anything, since
templates are read through separate code (`loadTemplates`), not through this
list.

If a project has no `.gitignore` at all, only `.git` is excluded (reading the
file is wrapped in try/catch; a missing file isn't treated as an error).

Only **directories** are walked — files never become path candidates.

## "Destination folder" is an autocomplete over existing folders

The prompt uses `type: "autocomplete"` from the `prompts` package. You can
type text to filter the list (`buildSuggest` does a case-insensitive
`includes`), but by default the choice is limited to folders that actually
exist and passed the `.gitignore` filter. There's no way to point generation
directly at an arbitrary, not-yet-existing path through this prompt — the
only way to get a new directory is answering "Yes" to "Create a new folder?",
which adds **one** extra level of nesting, named from `name` and
`template_naming_style`.

## Top-level `.fcode` files are loaded but unused

`loadFcodeFiles(root)` (`src/shared/fcode-files.ts`) reads files that live
**directly** inside `.fcode/` (not `.fcode/templates/`), and logs their
count. The returned value (`Map<string, string>`) is discarded in
`runGenerateFromTemplate` and has no effect on generation — as of today this
is purely a diagnostic step (`Loaded files from .fcode: N`). If you put files
directly in `.fcode/` (not in `templates/`), expect them to be counted but
not used in template rendering.

## Existing files are overwritten without warning

`copyTemplate` (`src/generate-from-template/templates.ts`) calls `writeFile`
directly, with no existence check and no confirmation prompt. Running
generation again with the same path/name **silently overwrites** already
generated files.

## Binary files in templates are not supported

Every template file's content is read as UTF-8 text
(`readFile(srcPath, "utf8")`) and run through `renderTemplate` (a regex
replacement). For non-text files (images, fonts, archives) this corrupts the
data on write. Keep templates text-only.

## A `_props.json` that fails to parse is not an error

`loadProps` wraps `JSON.parse` in try/catch: any `_props.json` that doesn't
exist or contains invalid JSON is quietly treated as "no additional props" —
the CLI doesn't fail or warn about it.

## Question order is fixed and not configurable

The "Name" (`name`) question always comes **before** the `_props.json`
questions, regardless of whether `_props.json` has a similarly-named key.
The order of the additional prop questions follows the key order in the
`_props.json` object (i.e. JS object key insertion order).

## `template_naming_style` is unused when creating a template (`--crt`)

`runCreateTemplate` always formats the new template folder's name with
`kebabcase`, regardless of `template_naming_style` in
`fcode.config.json` (and regardless of whether the config even exists —
`--create-template` doesn't read it).

## Cancelling the dialog

`prompts` returns `undefined` for the corresponding field on cancellation
(Ctrl+C, Esc). The key points where the flow exits without an error:

- an empty/cancelled answer to "Destination folder" → early `return` in
  `runGenerateFromTemplate` (no files are created);
- an empty/cancelled answer to "Template" → same behavior;
- an empty/cancelled "Template name" in `runCreateTemplate` → early `return`
  (no template is created).

Cancelling "Name" (in generation mode) or the prop questions doesn't stop the
flow — the corresponding values become `undefined`/empty strings and resolve
to empty strings in placeholders.

## Extension points (for contributors)

- Formatters are registered in one place — the `formatters` object in
  `src/shared/formatters.ts`. Adding a new formatter = adding a key to this
  object (the key name automatically becomes usable both in placeholders and
  as a `template_naming_style` value).
- The only supported placeholder namespace is `PROPS`
  (`src/shared/template-render.ts`, `resolvePlaceholder`). Supporting other
  namespaces would require changes to `resolvePlaceholder`.
- CLI flags are parsed manually (`hasFlag` in `src/index.ts`) — there's no
  argument-parsing library, and `--help`/`--version` aren't implemented at
  the moment.
