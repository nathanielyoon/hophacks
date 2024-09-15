import { defineConfig, PluginOption, Rollup } from "vite";

export default defineConfig({
  esbuild: {
    banner: "// gnu.org/licenses/gpl-3.0.txt",
    mangleProps: /[^_]_$/,
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
      },
    },
  },
});
