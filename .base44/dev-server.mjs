// Base44 sandbox dev server for this static site.
// Zero dependencies: serves the repo root on PORT and pushes an SSE reload
// signal whenever a source file changes (polling, so bind mounts are fine).
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";
const SKIP = new Set([".git", "node_modules"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const RELOAD_CLIENT = `<script>
(() => {
  try {
    const source = new EventSource("/__base44_reload");
    source.addEventListener("reload", () => window.location.reload());
  } catch {}
})();
</script>`;

const clients = new Set();

function broadcast() {
  for (const response of clients) {
    try {
      response.write("event: reload\ndata: 1\n\n");
    } catch {}
  }
}

async function signature() {
  const parts = [];
  async function walk(dir, depth) {
    if (depth > 3) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path, depth + 1);
        continue;
      }
      try {
        const info = await stat(path);
        parts.push(`${path}:${info.mtimeMs}:${info.size}`);
      } catch {}
    }
  }
  await walk(ROOT, 0);
  return parts.sort().join("|");
}

function inject(html) {
  return html.includes("</body>")
    ? html.replace("</body>", `${RELOAD_CLIENT}\n</body>`)
    : html + RELOAD_CLIENT;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");

  if (url.pathname === "/__base44_reload") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    response.write("retry: 1000\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = "/";
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = normalize(join(ROOT, pathname));
  if (!filePath.startsWith(ROOT + sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    let body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    if (type.startsWith("text/html")) {
      body = Buffer.from(inject(body.toString("utf8")), "utf8");
    }
    response.writeHead(200, {
      "Content-Type": type,
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

let lastSignature = await signature();
setInterval(async () => {
  const next = await signature();
  if (next !== lastSignature) {
    lastSignature = next;
    broadcast();
  }
}, 900).unref();

server.listen(PORT, HOST, () => {
  console.log(`serving ${ROOT} at http://${HOST}:${PORT}`);
});
