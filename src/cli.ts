#!/usr/bin/env node
import { run } from "./index.ts";

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
