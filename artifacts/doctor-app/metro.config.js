const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver.blockList = [
  /[\/\\]\.local[\/\\].*/,
];

config.server = config.server || {};
const origEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = origEnhanceMiddleware ? origEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => {
    const urlNoQuery = (req.url || "").split("?")[0];
    const isHtml =
      urlNoQuery === "/" ||
      urlNoQuery === "/index.html" ||
      urlNoQuery === "/doctor-app" ||
      urlNoQuery === "/doctor-app/" ||
      urlNoQuery.endsWith(".html");
    if (isHtml) {
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      let body = "";
      res.write = (chunk) => { body += chunk.toString(); return true; };
      res.end = (chunk) => {
        if (chunk) body += chunk.toString();
        if (/<\/head>/i.test(body)) {
          body = body.replace(
            /<\/head>/i,
            `<style>html,body,#root{background-color:#060E12 !important;margin:0;}</style></head>`
          );
          res.setHeader("content-length", Buffer.byteLength(body));
        }
        origWrite(body);
        origEnd();
      };
    }
    base(req, res, next);
  };
};

module.exports = config;
