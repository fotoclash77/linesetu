const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver.blockList = [
  /[\/\\]\.local[\/\\].*/,
];

const baseUrl = "/doctor-app";
config.server = config.server || {};
const origEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = origEnhanceMiddleware ? origEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => {
    const isHtml = req.url === "/" || req.url === `${baseUrl}/` || req.url === `${baseUrl}`;
    if (req.url.startsWith(`${baseUrl}/`)) {
      req.url = req.url.slice(baseUrl.length);
      req.originalUrl = req.url;
    } else if (req.url === baseUrl) {
      req.url = "/";
      req.originalUrl = "/";
    }
    if (isHtml) {
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      let body = "";
      res.write = (chunk) => { body += chunk.toString(); return true; };
      res.end = (chunk) => {
        if (chunk) body += chunk.toString();
        body = body.replace(
          /src="\/node_modules\//g,
          `src="${baseUrl}/node_modules/`
        );
        body = body.replace(
          /src='\/node_modules\//g,
          `src='${baseUrl}/node_modules/`
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
