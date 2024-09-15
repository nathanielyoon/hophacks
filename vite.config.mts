import { defineConfig, PluginOption, Rollup } from "vite";

export default defineConfig({
  esbuild: {
    banner: "// gnu.org/licenses/gpl-3.0.txt",
    mangleProps: /[^_]_$/,
  },
  plugins: [
    {
      name: "single-file",
      config: (A) => {
        A.base = "./";
        A.publicDir = false;
        A.build = {
          emptyOutDir: false,
          outDir: "dist/s",
          assetsDir: "",
          assetsInlineLimit: 1e9,
          chunkSizeWarningLimit: 1e9,
          cssCodeSplit: false,
          rollupOptions: {
            input: { single: "index.html" },
            output: { inlineDynamicImports: true },
          },
        };
      },
      enforce: "post",
      generateBundle(_, A) {
        const a: string[] = [], b: string[] = [], c: string[] = [];
        for (let z = 0, d = Object.keys(A), e; z < d.length; ++z) {
          if (/\.html?$/.test(e = d[z])) a.push(e);
          else if (/\.[mc]?js$/.test(e)) b.push(e);
          else if (/\.css$/.test(e)) c.push(e);
          else console.warn(`"${e}" not inlined`);
        }
        const d = new Set<string>();
        for (let z = 0, y, e, f, g, h, i: string; z < a.length; ++z) {
          e = A[a[z]] as Rollup.OutputAsset, f = e.source as string;
          for (y = 0; y < b.length; ++y) {
            d.add(h = (g = A[b[z]] as Rollup.OutputChunk).fileName);
            (i = g.code) && (f = f.replace(
              RegExp(`<script[^>]*? src="[./]*${h}"[^>]*></script>`),
              `<script>
${i.replaceAll('"__VITE_PRELOAD__"', "void 0")}  </script>`,
            ).replace(/\(function(?: polyfill)?\(\)\s*\{.*?\}\)\(\);/, ""));
          }
          for (y = 0; y < c.length; ++y) {
            d.add(h = (g = A[c[z]] as Rollup.OutputAsset).fileName);
            (i = g.source as string) && (f = f.replace(
              RegExp(`<link[^>]*? href="[./]*${h}"[^>]*?>`),
              `<style>
${i.replace('@charset "UTF-8";', "")}  </style>`,
            ));
          }
          e.source = f;
        }
        for (const e of d) delete A[e];
      },
    },
  ],
});
