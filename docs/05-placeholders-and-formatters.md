# Placeholders and Formatters

Implementation: `src/shared/template-render.ts` + `src/shared/formatters.ts`.

## Placeholder syntax

```
[% PROPS.<propName> %]
[% PROPS.<propName> | <formatter> %]
[% PROPS.<propName> | <formatter1> | <formatter2> | ... %]
```

Parsing rules (regex `/\[%\s*([^%]+?)\s*%\]/g`):

- The opening/closing delimiters are `[%` ... `%]`; spaces right inside the
  brackets are optional and trimmed: `[%PROPS.name%]` and
  `[% PROPS.name %]` are equivalent.
- The only supported namespace is `PROPS`. Anything that doesn't start with
  `PROPS.` resolves to an empty string (e.g. `[% FOO.bar %]` → `""`).
- After `PROPS.` comes exactly one prop name (no nesting via dots —
  `PROPS.a.b` parses as namespace `PROPS`, key `a`; the part after the second
  dot is dropped and never used).
- Formatters are listed separated by `|`, applied **left to right, in
  sequence**: the result of the first formatter becomes the input for the
  next, and so on.
- Spaces around `|` and formatter names are trimmed (`.trim()` on each part).
- If a prop isn't provided (not asked/empty in `_props.json`, or the key
  doesn't exist at all), the value resolves to an empty string `""`, and
  formatters are then applied to that empty string.
- An unknown formatter name does **not** raise an error — it's simply
  skipped (the value stays as it was at that point in the chain).
- Formatter names are **case-insensitive**: `kebabcase`, `KebabCase`,
  `KEBABCASE` are identical (compared via `.toLowerCase()`).
- Rendering is applied both to **file content** and to **file and folder
  names** — the same `renderTemplate` call handles both.

## The `name` prop

`name` is a special prop:

- **Always** available, in every template, even if it isn't described in
  `_props.json`.
- Asked as a separate "Name" question **before** the other props from
  `_props.json`.
- Used in placeholders exactly like any other prop:
  `[% PROPS.name | pascalcase %]`.
- Also participates in computing the new subfolder's name (see
  [03-configuration.md](./03-configuration.md), `template_naming_style`) —
  but that's a separate formatting path, not through file placeholders.

## Formatters

Implementation: `src/shared/formatters.ts`. Word splitting (`splitWords`)
happens at camelCase boundaries (`fooBar` → `foo`, `Bar`), at sequences of
consecutive uppercase letters followed by a capitalized word (`XMLParser` →
`XML`, `Parser`), and at space/`_`/`-` separators.

| Formatter | Behavior | Example input `myProp Name` | Result |
| --- | --- | --- | --- |
| `kebabcase` | lowercase words joined with `-` | `myProp Name` | `my-prop-name` |
| `snakecase` | lowercase words joined with `_` | `myProp Name` | `my_prop_name` |
| `camelcase` | first word lowercase, rest capitalized, joined | `myProp Name` | `myPropName` |
| `pascalcase` | all words capitalized, joined | `myProp Name` | `MyPropName` |
| `uppercase` | the whole input uppercased (no word splitting) | `myProp Name` | `MYPROP NAME` |
| `lowercase` | the whole input lowercased (no word splitting) | `myProp Name` | `myprop name` |

> Important: `uppercase`/`lowercase` don't go through `splitWords` — they
> just change the case of the whole string as-is, including spaces and
> separators. The other four formatters first split the string into words,
> then reassemble it with the appropriate case and separator.

## Chaining examples

Input: `name = "my_cool feature-Name"`.

| Placeholder | Result |
| --- | --- |
| `[% PROPS.name %]` | `my_cool feature-Name` (no formatter — as-is) |
| `[% PROPS.name \| kebabcase %]` | `my-cool-feature-name` |
| `[% PROPS.name \| pascalcase %]` | `MyCoolFeatureName` |
| `[% PROPS.name \| snakecase \| uppercase %]` | `MY_COOL_FEATURE_NAME` (snakecase → `my_cool_feature_name`, then uppercase on the whole string) |
| `[% PROPS.name \| unknownFormatter %]` | `my_cool feature-Name` (unknown formatter silently skipped) |
| `[% PROPS.missing \| kebabcase %]` | `""` (prop not set → empty string → kebabcase of an empty string is still empty) |

## Using placeholders in file/folder names

```
ui/[%PROPS.name|kebabcase%].tsx
```

With `name = "MyButton"`, this becomes the file `ui/my-button.tsx`. Multiple
placeholders can be combined in one name too:

```
[%PROPS.feature|kebabcase%]-[%PROPS.type|lowercase%].ts
```

With `feature = "UserProfile"`, `type = "Slice"` → `user-profile-slice.ts`.
