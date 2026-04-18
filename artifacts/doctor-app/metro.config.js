const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const http = require("http");

const APP_PREFIX = "/doctor-app";

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

// Monkey-patch @expo/cli's appendScriptsToHtml so that script src paths
// served by the dev server are prefixed with our app base path.
// This is needed because Metro's enhanceMiddleware only wraps the bundle handler,
// not the HTML manifest middleware, so we patch at the source.
try {
  const htmlModule = require("@expo/cli/build/src/export/html");
  const origAppend = htmlModule.appendScriptsToHtml;
  htmlModule.appendScriptsToHtml = function (htmlStr, scripts) {
    const prefixed = (scripts || []).map((s) => {
      if (typeof s === "string" && s.startsWith("/") && !s.startsWith(APP_PREFIX + "/")) {
        return APP_PREFIX + s;
      }
      return s;
    });
    return origAppend(htmlStr, prefixed);
  };
  console.log("[doctor-metro] Patched appendScriptsToHtml with prefix", APP_PREFIX);
} catch (e) {
  console.warn("[doctor-metro] Could not patch appendScriptsToHtml:", e.message);
}

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

    // Redirect /doctor-app (no trailing slash) → /doctor-app/ so Expo Router matches the index route.
    // Without the slash, window.location.pathname is "/doctor-app" and stripping the base URL
    // leaves an empty string which Expo Router treats as "Unmatched Route".
    if (urlNoQuery === BASE) {
      const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      res.writeHead(301, { Location: BASE + "/" + qs });
      res.end();
      return;
    }

    // Strip /doctor-app prefix from incoming requests so Metro processes them normally.
    // HTML responses from Metro already have the prefix added via the html.js patch.
    if (req.url && req.url.startsWith(BASE + "/")) {
      req.url = req.url.slice(BASE.length) || "/";
    }

    base(req, res, next);
  };
};

module.exports = config;
