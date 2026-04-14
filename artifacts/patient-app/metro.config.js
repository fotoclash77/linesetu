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

module.exports = config;
