const fs = require('fs');
const path = require('path');

const PNPM_DIR = path.join(__dirname, '..', '..', '..', 'node_modules', '.pnpm');
const OLD = "if (process.env.NODE_ENV !== 'development') {";
const NEW = "if (true) { // LINESETU PATCH: enable base URL in dev mode";
const MARKER = "LINESETU PATCH";

const FILES_TO_PATCH = [
  'getPathFromState-forks.js',
  'getPathFromState.js',
  'getStateFromPath-forks.js',
];

let forkDir;
try {
  const dirs = fs.readdirSync(PNPM_DIR)
    .filter(d => d.startsWith('expo-router@'))
    .sort();
  if (dirs.length === 0) {
    console.log('[patch-expo-router] expo-router not found in .pnpm — skipping');
    process.exit(0);
  }
  if (dirs.length > 1) {
    console.warn(`[patch-expo-router] WARNING: ${dirs.length} expo-router versions found, patching all`);
  }
  for (const dir of dirs) {
    const candidate = path.join(PNPM_DIR, dir, 'node_modules', 'expo-router', 'build', 'fork');
    if (fs.existsSync(candidate)) {
      forkDir = candidate;
      break;
    }
  }
  if (!forkDir) {
    console.error('[patch-expo-router] ERROR: Could not find expo-router/build/fork directory');
    process.exit(1);
  }
} catch (err) {
  console.error('[patch-expo-router] ERROR locating expo-router:', err.message);
  process.exit(1);
}

let patched = 0;
let alreadyPatched = 0;

for (const file of FILES_TO_PATCH) {
  const fp = path.join(forkDir, file);
  if (!fs.existsSync(fp)) {
    console.warn(`[patch-expo-router] WARNING: ${file} not found — skipping`);
    continue;
  }

  let src = fs.readFileSync(fp, 'utf8');

  if (src.includes(MARKER)) {
    alreadyPatched++;
    continue;
  }

  if (!src.includes(OLD)) {
    console.error(`[patch-expo-router] ERROR: expected pattern not found in ${file}`);
    console.error(`  Pattern: ${OLD}`);
    process.exit(1);
  }

  src = src.replace(OLD, NEW);

  if (!src.includes(MARKER)) {
    console.error(`[patch-expo-router] ERROR: replacement failed in ${file}`);
    process.exit(1);
  }

  fs.writeFileSync(fp, src);
  console.log(`[patch-expo-router] patched ${file}`);
  patched++;
}

if (alreadyPatched === FILES_TO_PATCH.length) {
  console.log('[patch-expo-router] all files already patched — nothing to do');
} else {
  console.log(`[patch-expo-router] done: ${patched} patched, ${alreadyPatched} already patched`);
}
