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
    if (req.url === "/" || req.url === `${baseUrl}/` || req.url === `${baseUrl}`) {
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);
      let body = "";
      res.write = (chunk) => { body += chunk.toString(); return true; };
      res.end = (chunk) => {
        if (chunk) body += chunk.toString();
        body = body.replace(
          '<head>',
          `<head><base href="${baseUrl}/">`
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
