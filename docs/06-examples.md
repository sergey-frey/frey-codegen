# Template Examples

The first three examples below are the real templates shipped in this repo's
own `.fcode/templates/` — used by frey-codegen's maintainers, and useful as a
live reference. The remaining examples are illustrative-only templates kept
in [`docs/examples/`](./examples/) (not part of `.fcode/templates/`, so they
don't show up in this project's own template list) — copy them into your own
`.fcode/templates/` to try them out.

## 1. `.fcode/templates/simple-template` — minimal template, no props

```
.fcode/templates/simple-template/
  index.ts
```

`index.ts`:

```ts
console.log("[%PROPS.name%]");
```

No `_props.json` → the only question during generation is "Name".

Run with `name = "Server started"`:

```
Destination folder: src/
Template: simple-template
Name: Server started
Create a new folder?: No
```

Result — file `src/index.ts`:

```ts
console.log("Server started");
```

(The file name has no placeholder, so it never changes — running this again
into the same folder overwrites the file.)

## 2. `.fcode/templates/react-component` — placeholders in content and in the file name

```
.fcode/templates/react-component/
  index.ts
  ui/
    [%PROPS.name|kebabcase%].tsx
```

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

Run with `name = "myButton"`, path `src/components/`, "Create a new folder?"
→ No:

Result:

```
src/components/
  index.ts
  ui/
    my-button.tsx
```

`index.ts`:

```ts
export { MyButton } from "./ui/my-button";
```

`ui/my-button.tsx`:

```tsx
interface IProps {}

export const MyButton = ({}: IProps) => {
  return <></>;
};
```

Answering "Yes" to "Create a new folder?" instead (with
`template_naming_style: "pascalcase"`, as configured in this repo) puts the
same output under `src/components/MyButton/`.

## 3. `.fcode/templates/test-template` — template with an empty `_props.json`

```
.fcode/templates/test-template/
  _props.json    # contains {}
```

`_props.json` with content `{}` is valid but describes zero additional
props. The only file in this template is `_props.json` itself, which is
**skipped** during copying. The result of generating from this template is
therefore an **empty destination directory** (just `mkdir`, no files
appear). This is the kind of skeleton left behind by `fcode
--create-template` — real files need to be added by hand.

## 4. `docs/examples/redux-slice` — a template with multiple additional props

```
docs/examples/redux-slice/
  _props.json
  [%PROPS.sliceName|kebabcase%]/
    index.ts
    [%PROPS.sliceName|kebabcase%].slice.ts
```

`_props.json`:

```json
{
  "sliceName": {
    "label": "Slice name (e.g. user)"
  },
  "initialValue": {
    "label": "Initial state value (JS expression)"
  }
}
```

`[%PROPS.sliceName|kebabcase%]/[%PROPS.sliceName|kebabcase%].slice.ts`:

```ts
import { createSlice } from "@reduxjs/toolkit";

export const [%PROPS.sliceName|camelcase%]Slice = createSlice({
  name: "[%PROPS.sliceName|kebabcase%]",
  initialState: [%PROPS.initialValue%],
  reducers: {},
});

export const { actions: [%PROPS.sliceName|camelcase%]Actions } = [%PROPS.sliceName|camelcase%]Slice;
```

`[%PROPS.sliceName|kebabcase%]/index.ts`:

```ts
export * from "./[%PROPS.sliceName|kebabcase%].slice";
```

Note: `name` isn't used in the content at all here (this template relies on
its own `sliceName` prop) — but the CLI still asks "Name" at step 8 of the
general flow, since that question is unconditional. Its value is simply
unused in the files, but still participates in computing the new subfolder's
name if you answer "Yes" to "Create a new folder?".

Run with `sliceName = "User Profile"`, `initialValue = "{ loaded: false }"`,
path `src/store/`, "Create a new folder?" → No:

```
src/store/
  user-profile/
    index.ts
    user-profile.slice.ts
```

`user-profile.slice.ts`:

```ts
import { createSlice } from "@reduxjs/toolkit";

export const userProfileSlice = createSlice({
  name: "user-profile",
  initialState: { loaded: false },
  reducers: {},
});

export const { actions: userProfileActions } = userProfileSlice;
```

To try this template yourself, copy it into your project:

```bash
cp -r docs/examples/redux-slice .fcode/templates/redux-slice
```

## 5. `docs/examples/api-hook` — single-file template with a composite name

```
docs/examples/api-hook/
  use-[%PROPS.name|kebabcase%].ts
```

```ts
export function use[%PROPS.name|pascalcase%]() {
  // ...
}
```

With `name = "current user"` → file `use-current-user.ts`:

```ts
export function useCurrentUser() {
  // ...
}
```

Try it: `cp -r docs/examples/api-hook .fcode/templates/api-hook`.

## Creating a template like this via the CLI

```bash
fcode --crt
# Template name: redux slice
# → creates .fcode/templates/redux-slice/_props.json with "{}"
```

The rest of `_props.json` and the remaining files are then written by hand,
as shown above — the `--create-template` command only reserves the folder
and creates an empty props file (see
[02-cli-commands.md](./02-cli-commands.md)).
