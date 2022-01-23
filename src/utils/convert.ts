import { deflate } from "pako";
import { woff2 as Woff2, FontEditor } from "fonteditor-core";

// @ts-ignore
import woff2Wasm from "../../node_modules/fonteditor-core/woff2/woff2.wasm";

export async function toTTF(font: FontEditor.Font) {
  return font.write({ type: "ttf" });
}

export async function toWoff(font: FontEditor.Font) {
  return font.write({
    type: "woff",
    deflate: (d) => deflate(Uint8Array.from(d)) as any,
  });
}

export async function toWoff2(font: FontEditor.Font) {
  await Woff2.init(woff2Wasm);
  return font.write({ type: "woff2" });
}

export async function toCSS(name: string) {
  return [
    `@font-face {`,
    `  font-family: "${name}";`,
    `  font-display: wrap;`,
    `  src: url("${name}.woff2") format("woff2"),`,
    `       url("${name}.woff") format("woff"),`,
    `       url("${name}.ttf") format("truetype");`,
    `}`,
  ].join("\n");
}
