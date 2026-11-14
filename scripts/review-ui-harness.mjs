// Synthetic UI only: no environment files, credentials or Cloud client.
import { createServer } from "vite";
import path from "node:path";
const repo = process.cwd();
const server = await createServer({
  configFile: false,
  root: path.join(repo, "tests/fixtures/review-browser"),
  envDir: false,
  resolve: { alias: { "@": path.join(repo, "src") } },
  oxc: { jsx: { runtime: "automatic" } },
  css: { postcss: repo },
  server: {
    host: "127.0.0.1",
    port: 3110,
    strictPort: true,
    fs: {
      strict: true,
      allow: ["src", "tests", "node_modules"].map((p) => path.join(repo, p)),
    },
  },
});
await server.listen();
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
