const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const APP_PREFIX = "/patient-app";

process.on("uncaughtException", (err) => {
  if (err && err.type === "UnableToResolveError") {
    console.warn("[patient-metro] Suppressed HMR resolve error for:", err.targetModuleName || "unknown");
    return;
  }
  throw err;
});
process.on("unhandledRejection", (reason) => {
  if (reason && reason.type === "UnableToResolveError") {
    console.warn("[patient-metro] Suppressed HMR rejection for:", reason.targetModuleName || "unknown");
    return;
  }
});

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
  console.log("[patient-metro] Patched appendScriptsToHtml with prefix", APP_PREFIX);
} catch (e) {
  console.warn("[patient-metro] Could not patch appendScriptsToHtml:", e.message);
}

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver.blockList = [
  /node_modules\/razorpay\/.*/,
  /node_modules\/.pnpm\/razorpay.*/,
  // Exclude the .local directory (skills, tasks, temp files) — these can be
  // deleted at any time and Metro crashing on a missing watched path.
  /[\/\\]\.local[\/\\].*/,
];

const BASE = "/patient-app";

config.server = config.server || {};
const origEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = origEnhanceMiddleware ? origEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => {
    // Strip /patient-app prefix from incoming requests (shared proxy forwards them with prefix intact)
    if (req.url && (req.url === BASE || req.url.startsWith(BASE + "/") || req.url.startsWith(BASE + "?"))) {
      req.url = req.url.slice(BASE.length) || "/";
    }
    const urlNoQuery = (req.url || "").split("?")[0];
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
        // Prefix bare /node_modules/, /_expo/, /__metro/ paths with /patient-app/
        // so the proxy routes them back to this Metro server.
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
          `<style>html,body,#root{background-color:#060A14 !important;margin:0;}</style></head>`
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
