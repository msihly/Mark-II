import { defineConfig } from "vite";
import pluginReact from "@vitejs/plugin-react";
import pluginRenderer from "vite-plugin-electron-renderer";
import pluginSVGR from "vite-plugin-svgr";
import pluginTsconfigPaths from "vite-tsconfig-paths";

const EXTERNALS = ["crypto", "fs", "mongoose", "path"];

export default defineConfig({
  build: { outDir: "build" },
  plugins: [
    pluginReact(),
    pluginRenderer({ nodeIntegration: true, optimizeDeps: { include: EXTERNALS } }),
    pluginSVGR(),
    pluginTsconfigPaths(),
  ],
  server: { port: 3737 },
});
