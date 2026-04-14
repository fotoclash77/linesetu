const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver.blockList = [
  // Exclude .local directory (skills, tasks, temp files) to prevent Metro
  // from crashing when an internal directory is deleted.
  /[\/\\]\.local[\/\\].*/,
];

module.exports = config;
