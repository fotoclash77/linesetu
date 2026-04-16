const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const http = require("http");

// Suppress UnableToResolveError crashes caused by the patient app's HMR
// WebSocket registering its entry points with this Metro server.
process.on("uncaughtException", (err) => {
  if (err && err.type === "UnableToResolveError") {
    console.warn("[doctor-metro] Suppressed HMR resolve error for:", err.targetModuleName || "unknown");
    return;
  }
  throw err;
});
process.on("unhandledRejection", (reason) => {
  if (reason && reason.type === "UnableToResolveError") {
    console.warn("[doctor-metro] Suppressed HMR rejection for:", reason.targetModuleName || "unknown");
    return;
  }
});

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver.blockList = [
  /[\/\\]\.local[\/\\].*/,
];

const BASE = "/doctor-app";

function proxyToPatientApp(req, res) {
  const stripped = req.url.replace(/^\/patient-app/, "") || "/";
  const target = { hostname: "localhost", port: 20117, path: stripped, method: req.method, headers: req.headers };
  const proxyReq = http.request(target, (proxyRes) => {
    const isHtml = (proxyRes.headers["content-type"] || "").includes("text/html");
    if (!isHtml) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
      return;
    }
    let body = "";
    proxyRes.on("data", (chunk) => { body += chunk.toString(); });
    proxyRes.on("end", () => {
      body = body.replace(/(['"])\/(node_modules\/)/g, (_, q, r) => `${q}/patient-app/${r}`);
      body = body.replace(/(['"])\/((_expo|__metro)\/)/g, (_, q, r) => `${q}/patient-app/${r}`);
      body = body.replace(/<\/head>/i, `<style>html,body,#root{background-color:#060A14 !important;margin:0;}</style></head>`);
      const headers = { ...proxyRes.headers, "content-length": Buffer.byteLength(body) };
      res.writeHead(proxyRes.statusCode, headers);
      res.end(body);
    });
  });
  proxyReq.on("error", () => res.writeHead(502) && res.end());
  req.pipe(proxyReq, { end: true });
}

config.server = config.server || {};
const origEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = origEnhanceMiddleware ? origEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => {
    const urlNoQuery = (req.url || "").split("?")[0];

    // Proxy all /patient-app/* requests to the patient app Metro server
    if (urlNoQuery.startsWith("/patient-app/") || urlNoQuery === "/patient-app") {
      return proxyToPatientApp(req, res);
    }

    const isHtml =
      urlNoQuery === "/" ||
      urlNoQuery === "/index.html" ||
      urlNoQuery.endsWith(".html");
    if (isHtml) {
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      let body = "";
      res.write = (chunk) => { body += chunk.toString(); return true; };
      res.end = (chunk) => {
        if (chunk) body += chunk.toString();
        // Prefix bare /node_modules/, /_expo/, /__metro/ paths with /doctor-app/
        // so the proxy routes them back to this Metro server, not the patient app.
        // Guard against double-prefixing.
        body = body.replace(
          /(['"])\/(node_modules\/)/g,
          (_, q, rest) => `${q}${BASE}/${rest}`
        );
        body = body.replace(
          /(['"])\/((_expo|__metro)\/)/g,
          (_, q, rest) => `${q}${BASE}/${rest}`
        );
        body = body.replace(
          /<\/head>/i,
          `<style>html,body,#root{background-color:#060E12 !important;margin:0;}</style></head>`
        );
        res.setHeader("content-length", Buffer.byteLength(body));
        origWrite(body);
        origEnd();
      };
    }
    base(req, res, next);
  };
};

module.exports = config;
