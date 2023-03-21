import { defineConfig } from "vite";
import pluginReact from "@vitejs/plugin-react";
import pluginSVGR from "vite-plugin-svgr";
import pluginTsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        options: resolve(__dirname, "options.html"),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    assetsInlineLimit: 0,
    minify: "esbuild",
    polyfillModulePreload: false,
    outDir: "build",
  },
  plugins: [pluginReact(), pluginSVGR(), pluginTsconfigPaths()],
  server: { port: 3737 },
});
