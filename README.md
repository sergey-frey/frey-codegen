# fcode

CLI generator for file and folder templates.

## Install and run

```bash
npm -D install frey-codegen
```

On startup the CLI:

1. Reads `fcode.config.json` from the project root (required).
2. Loads files from `.fcode/`.
3. Asks for the destination folder, the template, prop values, and whether to
   create a new subfolder.
4. Copies the chosen template to the destination, substituting prop values.

## `fcode.config.json`

Configuration file in the project root. Required — without it the CLI exits
with an error.

```json
{
  "template_naming_style": "kebabcase",
  "exclude": ["src", "dist"]
}
```

| Parameter               | Required | Description                                                                                                                           |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `template_naming_style`  | yes      | Naming style used for the new subfolder's name (the "Create a new folder?" step). One of the styles from the formatters table below. |
| `exclude`                | no       | List of folders to hide from the destination-folder picker. Uses `.gitignore`-style patterns (matched with the [`ignore`](https://www.npmjs.com/package/ignore) package). |

If the style is unknown, the CLI exits with an error when trying to create the
folder.

When the CLI walks the project to build the destination-folder list, it always
skips `.git` and anything matched by the project's root `.gitignore`, in
addition to the patterns from `exclude`.

## Templates (`.fcode/templates/`)

Each template is a subfolder inside `.fcode/templates/`. The subfolder name is
the template name shown in the selection list.

```
.fcode/
  templates/
    react-component/
      _props.json
      index.ts
      ui/
        [%PROPS.name|kebabcase%].tsx
```

When copying a template to the destination folder, the CLI recursively walks
all files and directories of the template and:

- renders `[% ... %]` placeholders both in file **content** and in **file and
  folder names**;
- skips the `_props.json` file (it isn't copied — it's only used to describe
  props);
- creates destination directories as needed.

### Placeholder syntax

```
[% PROPS.<prop_name> %]
[% PROPS.<prop_name> | <formatter> %]
[% PROPS.<prop_name> | <formatter1> | <formatter2> %]
```

- A placeholder is wrapped in `[% %]`; inner spaces are optional.
- The only supported namespace is `PROPS`, followed by a dot and the prop name
  (`PROPS.name`, `PROPS.myField`, etc.).
- The prop value can be piped through one or more formatters separated by `|`.
  Formatters are applied left to right, in sequence.
- If a prop is unset or unknown, an empty string is substituted.
- An unknown formatter is silently ignored (the value stays as-is at that
  step).

The `name` prop is always available, even if it isn't described in
`_props.json` — the CLI asks for it with a separate "Name" question on every
run.

### Formatters

| Formatter    | Example (`myProp Name`) |
| ------------ | ------------------------ |
| `kebabcase`  | `my-prop-name`           |
| `snakecase`  | `my_prop_name`           |
| `camelcase`  | `myPropName`             |
| `pascalcase` | `MyPropName`             |
| `uppercase`  | `MYPROP NAME`            |
| `lowercase`  | `myprop name`            |

Formatter names are case-insensitive (`kebabcase`, `KebabCase`, `KEBABCASE`
are equivalent).

### Example

`index.ts`:

```ts
export { [%PROPS.name|pascalcase%] } from "./ui/[%PROPS.name|kebabcase%]";
```

`ui/[%PROPS.name|kebabcase%].tsx`:

```tsx
interface IProps { }

export const [%PROPS.name|pascalcase%] = ({ }: IProps) => {
  return <></>
}
```

With prop value `name = "myButton"` the result is:

```
index.ts
ui/my-button.tsx
```

```ts
// index.ts
export { MyButton } from "./ui/my-button";
```

```tsx
// ui/my-button.tsx
interface IProps {}

export const MyButton = ({}: IProps) => {
  return <></>;
};
```

## `_props.json`

An optional file in the root of a template folder. Describes additional props
that the CLI will ask about via text questions before copying (on top of the
always-available `name`).

```json
{
  "myField": {
    "label": "Field description"
  }
}
```

Structure — an object where:

- the key is the prop name, used in placeholders as `PROPS.<key>`;
- the value is an object with fields:

| Field   | Required | Description                                                                  |
| ------- | -------- | ------------------------------------------------------------------------------ |
| `label` | no       | The question text shown to the user. If not set, the prop name is used instead. |

If `_props.json` is missing or fails to parse, the CLI treats the template as
having no additional props (only `name` is available).

## Documentation

Full documentation with detailed examples and internals lives in
[`docs/`](./docs/README.md).
