// Synthetic presentation harness only. No app environment, Auth or Cloud client.
import { createServer } from "vite";
import path from "node:path";
const repo = process.cwd();
const server = await createServer({
  configFile: false,
  root: path.join(repo, "tests/fixtures/quiz-browser"),
  envDir: false,
  resolve: { alias: { "@": path.join(repo, "src") } },
  oxc: { jsx: { runtime: "automatic" } },
  css: { postcss: repo },
  server: {
    host: "127.0.0.1",
    port: 3105,
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
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
