import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    banner: "// gnu.org/licenses/gpl-3.0.txt",
    mangleProps: /[^_]_$/,
  },
  build: {
    rollupOptions: {
      external: ["npm:@cloudflare/workers-types"],
      input: {
        index: "index.html",
        main: "main.html",
      },
    },
  },
});
