import { defineConfig } from "vite";
import pluginCommonJs from "vite-plugin-commonjs";
import pluginReact from "@vitejs/plugin-react";
import pluginRenderer from "vite-plugin-electron-renderer";
import pluginSVGR from "vite-plugin-svgr";
import pluginTsconfigPaths from "vite-tsconfig-paths";

const EXTERNALS = ["crypto", "electron-log", "fs", "mongoose", "path"];

const commonJs = pluginCommonJs();
commonJs.apply = undefined;

export default defineConfig({
  build: { outDir: "build", rollupOptions: { external: "ext" } },
  optimizeDeps: { exclude: EXTERNALS },
  plugins: [
    commonJs,
    pluginReact(),
    pluginRenderer({ nodeIntegration: true, resolve: () => EXTERNALS }),
    pluginSVGR(),
    pluginTsconfigPaths(),
  ],
  server: { port: 3737 },
});
