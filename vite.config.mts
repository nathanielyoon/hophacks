import { defineConfig } from "npm:vite@^5.3.4";

export default defineConfig({
  esbuild: {
    banner: "// gnu.org/licenses/gpl-3.0.txt",
    mangleProps: /[^_]_$/,
  },
});
