import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import {
  loadPreview,
  assertPresentationModules,
} from "./hsk1-preview-data.mjs";

export const origin = "http://127.0.0.1:3114";
export function requestStatus(req, paths) {
  if (
    req.socket.remoteAddress !== "127.0.0.1" ||
    req.headers.host !== "127.0.0.1:3114" ||
    (req.headers.origin && req.headers.origin !== origin) ||
    req.headers["sec-fetch-site"] === "cross-site"
  )
    return 403;
  if (!["GET", "HEAD"].includes(req.method)) return 405;
  // Exact generated allowlist: no repository paths, decoding or SPA fallback.
  const pathname = req.url.split("?")[0];
  return paths.has(pathname) ? 200 : 404;
}
export async function startPreview() {
  if (process.argv.length !== 2) throw Error("preview_no_arguments_allowed");
  const data = loadPreview();
  const repo = process.cwd();
  const outDir = path.join(repo, ".local/hsk1-preview/site");
  await build({
    configFile: false,
    root: path.join(repo, "tools/hsk1-preview"),
    envDir: false,
    envPrefix: "HANLEARN_UNUSED_PREVIEW_",
    resolve: { alias: { "@": path.join(repo, "src") } },
    oxc: { jsx: { runtime: "automatic" } },
    css: { postcss: repo },
    logLevel: "error",
    plugins: [
      {
        name: "verified-public-preview",
        resolveId(id) {
          if (id === "virtual:hanlearn-hsk1-preview") return "\0public-preview";
        },
        load(id) {
          if (id === "\0public-preview")
            return `export default ${JSON.stringify(data)};`;
        },
        generateBundle() {
          assertPresentationModules([...this.getModuleIds()]);
        },
      },
    ],
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: false,
      modulePreload: false,
      assetsInlineLimit: 0,
    },
  });
  const files = new Map();
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
  };
  function collect(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) collect(full);
      else if (e.isFile()) {
        const relative = path.relative(outDir, full).replaceAll("\\", "/");
        if (relative !== "index.html" && !relative.startsWith("assets/"))
          throw Error("unexpected_preview_artifact");
        files.set(relative === "index.html" ? "/" : `/${relative}`, {
          body: fs.readFileSync(full),
          type: mime[path.extname(full)] || "application/octet-stream",
        });
      } else throw Error("preview_symlink_rejected");
    }
  }
  collect(outDir);
  const server = http.createServer((req, res) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Referrer-Policy", "no-referrer");
    const status = requestStatus(req, files);
    res.statusCode = status;
    if (status !== 200) {
      res.end("Preview request denied");
      return;
    }
    const file = files.get(req.url.split("?")[0]);
    res.setHeader("Content-Type", file.type);
    res.end(req.method === "HEAD" ? undefined : file.body);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(3114, "127.0.0.1", resolve);
  });
  console.log(
    `LOCAL CONTENT PREVIEW: ${origin} — verified r3; no Cloud or progress writes. Ctrl+C to stop.`,
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => {
      server.close();
      server.closeAllConnections();
    });
  return server;
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  startPreview().catch(() => {
    console.error(
      "BLOCKED: local preview validation/build/bind failed; no server exposed.",
    );
    process.exitCode = 1;
  });
}
