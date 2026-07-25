import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");
const assetsDir = path.resolve(rootDir, "assets");
const publicDir = path.resolve(rootDir, "public");
const adminDir = path.resolve(rootDir, "admin");

function assertInsideRoot(targetPath) {
  const relative = path.relative(rootDir, targetPath);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to operate outside project root: ${targetPath}`);
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resetDist() {
  assertInsideRoot(distDir);

  if (path.basename(distDir) !== "dist") {
    throw new Error(`Refusing to remove unexpected build directory: ${distDir}`);
  }

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
}

function isTemporaryPublicSegment(segment) {
  const lower = segment.toLowerCase();

  if (lower === "_contact-check-profile") {
    return true;
  }

  if (/^_hero-check-profile(?:-|$)/.test(lower)) {
    return true;
  }

  return lower.includes("profile") && (lower.startsWith("_") || lower.includes("check"));
}

function isTemporaryPublicFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return /^_(?:contact|hero)-check/i.test(normalized);
}

function shouldCopyPublicPath(sourcePath) {
  const relative = path.relative(publicDir, sourcePath);

  if (!relative) {
    return true;
  }

  const segments = relative.split(path.sep);
  if (segments.some(isTemporaryPublicSegment)) {
    return false;
  }

  return !isTemporaryPublicFile(relative);
}

async function copyRootHtmlFiles() {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === ".html")
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of htmlFiles) {
    await fs.copyFile(path.join(rootDir, fileName), path.join(distDir, fileName));
  }

  return htmlFiles;
}

async function copyDirectoryIfPresent(sourceDir, targetDir, options = {}) {
  if (!(await pathExists(sourceDir))) {
    return false;
  }

  await fs.cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
    ...options
  });

  return true;
}

await resetDist();

const htmlFiles = await copyRootHtmlFiles();
const copiedAssets = await copyDirectoryIfPresent(assetsDir, path.join(distDir, "assets"));
const copiedPublic = await copyDirectoryIfPresent(publicDir, path.join(distDir, "public"), {
  filter: shouldCopyPublicPath
});
const copiedAdmin = await copyDirectoryIfPresent(adminDir, path.join(distDir, "admin"));

console.log(`Copied ${htmlFiles.length} HTML files to dist.`);
console.log(copiedAssets ? "Copied assets/ to dist/assets." : "No assets/ directory found.");
console.log(copiedPublic ? "Copied public/ to dist/public with temporary profiles excluded." : "No public/ directory found.");
console.log(copiedAdmin ? "Copied admin/ to dist/admin." : "No admin/ directory found.");
