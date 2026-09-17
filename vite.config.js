import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Strip the legacy .woff fallback from @fontsource @font-face rules so only
// .woff2 is referenced (and therefore only .woff2 is emitted). Every browser
// that can run this app supports woff2, so the .woff files are dead weight.
function woff2Only() {
  return {
    name: "woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("@fontsource") || !id.endsWith(".css")) return null;
      // Drop `, url(...woff) format('woff')` from each src list.
      return code.replace(/,\s*url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/g, "");
    },
  };
}

// base: "./"  → assets are referenced with relative paths, so the built
//               site works from any nginx location (root or a subfolder).
// modulePreload.polyfill: false  → don't inject Vite's inline preload
//               polyfill, so the output has NO inline <script> at all.
// assetsInlineLimit: 0  → emit fonts/images as real files instead of
//               inlining them as data: URIs, keeping every asset same-origin.
export default defineConfig({
  base: "./",
  plugins: [woff2Only(), react()],
  build: {
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
  },
});
