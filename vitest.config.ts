import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    // Source-hash checks and Windows PowerShell fixtures compete for local CPU.
    maxWorkers: 4,
    testTimeout: 15000,
    include: ["tests/**/*.test.ts"],
    clearMocks: true,
  },
});
