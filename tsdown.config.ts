import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  target: "node20",
  // The package is "type": "module", so .js already means ESM; only the
  // CommonJS half needs a distinguishing extension. Without this tsdown emits
  // .mjs and the exports map in package.json would have to name it.
  fixedExtension: false,
  // Nothing to bundle and nothing to leave external — the package has no
  // dependencies. Stated rather than inherited.
  treeshake: true,
});
