import { builtinModules } from "node:module";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    target: "node20",
    lib: {
      entry: {
        index: "src/index.ts",
        cli: "src/cli.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`), "prompts", "ignore"],
    },
  },
});
