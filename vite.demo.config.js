import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  root: resolve(import.meta.dirname, "demo"),
  base: repositoryName ? `/${repositoryName}/` : "/",
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, "demo-dist"),
    emptyOutDir: true,
  },
});
