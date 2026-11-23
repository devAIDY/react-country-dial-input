import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-number-format",
  "phone",
];

export default defineConfig(({ command }) =>
  command === "serve"
    ? // `npm run dev` serves the playground in demo/.
      { root: "demo", plugins: [react()] }
    : {
        plugins: [react()],
        build: {
          outDir: "dist",
          emptyOutDir: true,
          sourcemap: true,
          lib: {
            entry: resolve(import.meta.dirname, "src/index.js"),
            formats: ["es", "cjs"],
            fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
          },
          rollupOptions: {
            // CJS: require("react-country-dial-input").default / .TelephoneInput
            output: { exports: "named" },
            external: (id) =>
              external.some((dep) => id === dep || id.startsWith(`${dep}/`)),
          },
        },
      },
);
