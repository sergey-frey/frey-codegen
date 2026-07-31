# Getting Started

## Install (inside the frey-codegen repo)

```bash
npm install
npm run build   # tsc + vite build, makes dist/cli.js executable
npm start        # equivalent to `node dist/cli.js`
```

## Install as a dependency / globally

The package builds the `fcode` binary declared in `package.json`:

```json
"bin": { "fcode": "./dist/cli.js" }
```

Ways to hook it up in your own project:

```bash
# locally, for developing fcode itself
npm run link      # npm run build && npm link

# after npm link, from any other project
npm link frey-codegen
fcode
```

Or install the package as a regular dependency (if published, or referenced
via a file:/git: path) and call it with `npx fcode`.

## Prerequisites in the target project

Before running `fcode` in a project where you want to generate files, that
project must have:

1. **`fcode.config.json`** in the root — otherwise the CLI fails immediately.
   See [03-configuration.md](./03-configuration.md).
2. **`.fcode/templates/<template-name>/`** — at least one template. If
   `.fcode/templates` doesn't exist, the CLI warns and exits without creating
   anything.

## A "hello world" template in 2 minutes

1. Create the config in the project root:

   ```json
   // fcode.config.json
   { "template_naming_style": "kebabcase" }
   ```

2. Create a template by hand (or via `fcode --crt`, see
   [02-cli-commands.md](./02-cli-commands.md)):

   ```
   .fcode/
     templates/
       hello/
         [%PROPS.name|kebabcase%].ts
   ```

   Content of `[%PROPS.name|kebabcase%].ts`:

   ```ts
   console.log("Hello, [%PROPS.name|pascalcase%]!");
   ```

3. Run:

   ```bash
   fcode
   ```

4. Answer the prompts:
   - **Destination folder** — pick/type an existing directory, e.g. `src/`.
   - **Template** — pick `hello`.
   - **Name** — e.g. `world example`.
   - **Create a new folder?** — `No`.

5. Result — the file `src/world-example.ts`:

   ```ts
   console.log("Hello, WorldExample!");
   ```

Continue with the rest of the docs for the full feature set.
