# Configuration: `fcode.config.json`

The file must live in the project root (wherever `fcode` is invoked from,
i.e. `process.cwd()`). It is **required** for generation mode (`fcode` with
no flags); it's not needed for `fcode --create-template`.

## Format

```json
{
  "template_naming_style": "kebabcase"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `template_naming_style` | `string` | yes | The name of a formatter (see [05-placeholders-and-formatters.md](./05-placeholders-and-formatters.md)) used to format the new subfolder's name when answering "Yes" to "Create a new folder?". |

## Error behavior

Implementation: `src/shared/config.ts`.

- **File not found or unreadable** → `Error: File fcode.config.json not found in <root>`.
- **File exists, but `template_naming_style` is empty/missing** → `Error: template_naming_style is not set in fcode.config.json`.
- **`template_naming_style` refers to an unknown formatter** — this check
  happens later, during generation itself (`resolveFolderName` in
  `generate-from-template.ts`), and **only if** the user answered "Yes" to
  "Create a new folder?": `Error: Unknown template_naming_style: <value>`.
  If the user always answers "No", a broken value in this field never
  surfaces.

Both errors bubble up to `src/cli.ts`, which prints `error.message` via
`console.error` and exits with code `1`.

## Example of a real config (frey-codegen itself)

```json
{
  "template_naming_style": "pascalcase"
}
```

Meaning: if during generation you answer "Yes" to "Create a new folder?" and
type `my new widget` as the name, the new subfolder in the destination
directory will be named `MyNewWidget`.

## Other settings?

Currently `template_naming_style` is the only configuration field. No
additional keys are supported (per-template overrides, custom formatters via
config, etc.) — extra fields in the JSON are simply ignored.
