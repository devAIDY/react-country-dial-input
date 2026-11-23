// Copies the files Vite does not emit: the stylesheet, the type definitions
// and the raw country list.
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

for (const [from, to] of [
  ["src/style.css", "dist/style.css"],
  ["src/index.d.ts", "dist/index.d.ts"],
  ["src/countries.json", "dist/countries.json"],
]) {
  copyFileSync(resolve(root, from), resolve(root, to));
  console.log(`copied ${from} -> ${to}`);
}
