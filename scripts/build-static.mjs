import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);

function shouldExcludePublicPath(sourcePath) {
  const normalized = sourcePath.split(sep).join("/").toLowerCase();
  const base = normalized.split("/").at(-1) ?? "";
  return (
    normalized.includes("profile") && (normalized.includes("_hero-check") || normalized.includes("_contact-check"))
  ) || base.startsWith("_hero-check") || base.startsWith("_contact-check");
}

async function copyPublic(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);
    if (shouldExcludePublicPath(sourcePath)) continue;
    if (entry.isDirectory()) await copyPublic(sourcePath, destinationPath);
    else if (entry.isFile()) await cp(sourcePath, destinationPath);
  }
}

async function collectImages(directory, publicPrefix) {
  const results = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (shouldExcludePublicPath(fullPath)) continue;
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase())) {
        const relativePath = relative(directory, fullPath).split(sep).join("/");
        results.push({ name: entry.name, path: `${publicPrefix}/${relativePath}` });
      }
    }
  }
  try { await walk(directory); } catch { return []; }
  return results;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const rootEntries = await readdir(root, { withFileTypes: true });
const htmlFiles = rootEntries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"));
for (const entry of htmlFiles) await cp(join(root, entry.name), join(dist, entry.name));
console.log(`Copied ${htmlFiles.length} HTML files to dist.`);

for (const directory of ["assets", "admin"]) {
  const source = join(root, directory);
  try {
    if ((await stat(source)).isDirectory()) {
      await cp(source, join(dist, directory), { recursive: true });
      console.log(`Copied ${directory}/ to dist/${directory}.`);
    }
  } catch { /* optional directory */ }
}

const publicSource = join(root, "public");
await copyPublic(publicSource, join(dist, "public"));
console.log("Copied public/ to dist/public with temporary check files excluded.");

const media = [
  ...(await collectImages(publicSource, "/public")),
  ...(await collectImages(join(root, "assets", "images"), "/assets/images"))
].sort((a, b) => a.name.localeCompare(b.name, "ar"));
await writeFile(join(dist, "admin", "media-manifest.json"), JSON.stringify(media), "utf8");
console.log(`Generated admin media manifest with ${media.length} images.`);
