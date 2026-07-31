# Template Anatomy

## Location

All templates live in `.fcode/templates/`, each template being a separate
subfolder:

```
.fcode/
  templates/
    <template-name-1>/
      _props.json          # optional
      ...files and subfolders...
    <template-name-2>/
      ...
```

The subfolder name = what the user sees in the template selection list (the
"Template" step in the CLI). There's no separate human-readable
name/metadata for a template — just the folder name on disk.

## `_props.json`

An optional file **in the root of the template folder** (it is not copied to
the output — `copyTemplate` explicitly skips it by name `_props.json`).

Format:

```json
{
  "<propName>": {
    "label": "The question text the user sees"
  },
  "<anotherProp>": {}
}
```

- The top-level key is the prop name, used in placeholders the same way, as
  `PROPS.<key>`.
- `label` is optional; if not set, the CLI question will simply show the key
  name.
- Any other fields on a prop object are currently not read
  (`interface PropField { label?: string }`) — if you add, say, `"default"`,
  it will be ignored.
- If `_props.json` is missing **or fails to parse** as valid JSON, the CLI
  quietly treats the template as having no additional props (no error is
  thrown). The only available prop in that case is `name`.

The `name` prop should **not** be described in `_props.json` — it's added
automatically and is always asked as a separate "Name" question, before the
other props.

## Files and subfolders in a template

- Every file (except `_props.json`) and every subfolder inside the template
  folder is copied to the destination directory as-is, recursively.
- **Names** of files and folders are rendered through the same placeholder
  engine as content — so you can name files like
  `[%PROPS.name|kebabcase%].tsx`, or even create subfolders with placeholders
  in their name (`[%PROPS.feature|kebabcase%]/index.ts`).
- **Content** of files is read and written as UTF-8 text
  (`readFile(..., "utf8")`) — binary files (images, fonts, etc.) in templates
  are not supported: their content would be run through a string regex
  replacement, which corrupts binary data on write.
- Empty directories inside a template are copied (created) the same as
  directories with files, since the walk is recursive per directory and
  `mkdir(destDir, { recursive: true })` is called at every level before
  copying its content.
- The destination directory is created automatically if it doesn't exist
  (`mkdir(..., { recursive: true })` at every nesting level).

## What happens if the destination file already exists

`copyTemplate` uses `writeFile` with no existence check — **files in the
destination directory are silently overwritten** if their name (after
placeholder rendering) matches an existing file. The CLI does not ask for
confirmation before overwriting.

## Example: minimal template

```
.fcode/templates/simple-template/
  index.ts
```

`index.ts`:

```ts
console.log("[%PROPS.name%]");
```

No `_props.json` → the only question during generation is "Name". With
`name = "Hello"`, the result is a file `index.ts` (name unchanged, no
placeholder in it) with content `console.log("Hello");`.

## Example: multi-file template with a subfolder

```
.fcode/templates/react-component/
  index.ts
  ui/
    [%PROPS.name|kebabcase%].tsx
```

A detailed walkthrough is in [06-examples.md](./06-examples.md).
