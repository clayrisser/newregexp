import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      reportsDirectory: "coverage",
      // text-summary rather than text: under vitest 4.1's v8 provider the
      // per-file table renders with no rows, while the totals and the lcov
      // report are both correct. The summary is the part worth reading in a
      // CI log anyway; swap back if the table starts working.
      reporter: ["text-summary", "lcov"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
