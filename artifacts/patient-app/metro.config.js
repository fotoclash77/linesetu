const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

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
