// Loopback-only synthetic component harness. No Auth shim, Cloud client or env file.
import { createServer } from "vite";
import path from "node:path";
const repo = process.cwd();
const server = await createServer({
  configFile: false,
  root: path.join(repo, "tests/fixtures/lesson-browser"),
  envDir: false,
  resolve: { alias: { "@": path.join(repo, "src") } },
  oxc: { jsx: { runtime: "automatic" } },
  css: { postcss: repo },
  server: {
    host: "127.0.0.1",
    port: 3103,
    strictPort: true,
    fs: {
      strict: true,
      allow: [
        path.join(repo, "src"),
        path.join(repo, "tests"),
        path.join(repo, "node_modules"),
      ],
    },
  },
});
await server.listen();
console.log("Synthetic lesson UI harness: loopback 3103; no Cloud access.");
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
