import { build } from "esbuild";
import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/viewer.mjs"],
  bundle: true,
  format: "esm",
  target: "es2020",
  outfile: "dist/eaagri-3d.js",
  minify: true,
  legalComments: "eof",
});
await copyFile("src/viewer.css", "dist/eaagri-3d.css");
await copyFile("node_modules/three/LICENSE", "licenses/THREE-MIT.txt");
console.log("Built self-hosted ES module and scoped CSS. No CDN needed.");
const js = await build({
  entryPoints: ["examples/demo.mjs"],
  bundle: true,
  write: false,
  format: "esm",
  target: "es2020",
  minify: true,
  legalComments: "eof",
});
const embedded = {};
for (const [key, file] of [
  ["high", "eaagri-durian-high.glb"],
  ["mobile", "eaagri-durian-mobile.glb"],
])
  embedded[key] =
    "data:model/gltf-binary;base64," +
    (await readFile("assets/" + file)).toString("base64");
try {
  embedded.poster =
    "data:image/png;base64," +
    (await readFile("assets/poster.png")).toString("base64");
} catch {}
let html = await readFile("index.html", "utf8");
html = html.replace(
  '<link rel="stylesheet" href="./dist/eaagri-3d.css">',
  "<style>" + (await readFile("dist/eaagri-3d.css", "utf8")) + "</style>",
);
html = html.replace(
  '<link rel="stylesheet" href="./examples/demo.css">',
  "<style>" + (await readFile("examples/demo.css", "utf8")) + "</style>",
);
html = html.replace(
  '<script type="module" src="./examples/demo.mjs"></script>',
  "<script>window.EAAGRI_PREVIEW_ASSETS=" +
    JSON.stringify(embedded) +
    "</script><script>" +
    js.outputFiles[0].text
      .replaceAll("import.meta.url", "document.baseURI")
      .replaceAll("</script", "<\\/script") +
    "</script>",
);
await writeFile("preview-offline.html", html);
console.log(
  "Built preview-offline.html (open directly, no installation required).",
);
