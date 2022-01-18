import fs from "fs-extra";
import path from "path";
import wawoff2 from "wawoff2";
import ttf2woffJs from "./ttf2woff.js";

interface Options {
  name?: string;
  outdir?: string;
  css?: boolean; // default is true
}

/**
 * Transform the ttf file to woff/woff2.
 * Can generate the css font-face.
 */
export default async function fontPack(font: string, options: Options = {}) {
  if (!font) {
    throw new Error("invalid font path");
  }

  if (!font.toLowerCase().endsWith(".ttf")) {
    throw new Error("only support ttf");
  }

  if (!(await fs.pathExists(font))) {
    throw new Error("font does't exists");
  }

  const outDir = options.outdir || path.dirname(font);
  const fontName = options.name || path.basename(font).slice(0, -4);

  const buffer = await fs.readFile(font);

  // copy the ttf file
  const copyTTF = async () => {
    const ttfFile = path.join(outDir, `${fontName}.ttf`);
    if (!(await fs.pathExists(ttfFile))) {
      await fs.copyFile(font, ttfFile);
    }
  };

  // to woff
  const toWoff = async () => {
    const woff = await ttf2woff(buffer);
    const woffFile = path.join(outDir, `${fontName}.woff`);
    await fs.writeFile(woffFile, woff, "binary");
  };

  // to woff2
  const toWoff2 = async () => {
    const woff2 = await wawoff2.compress(buffer);
    const woff2File = path.join(outDir, `${fontName}.woff2`);
    await fs.writeFile(woff2File, woff2, "binary");
  };

  // to css
  const toCss = async () => {
    const css = genCss(fontName);
    const cssFile = path.join(outDir, `${fontName}.css`);
    await fs.writeFile(cssFile, css);
  };

  await Promise.all([toWoff(), toWoff2()]);

  await copyTTF();

  if (options.css !== false) {
    await toCss();
  }
}

/**
 * transform ttf file buffer to woff
 */
export async function ttf2woff(buffer: Buffer) {
  return ttf2woffJs(new Uint8Array(buffer));
}

/**
 * transform ttf file buffer to woff2
 */
export async function ttf2woff2(buffer: Buffer) {
  return wawoff2.compress(buffer);
}

/**
 * according to the font name generate the css font-face
 */
export function genCss(name: string) {
  return [
    `@font-face {`,
    `  font-family: "${name}";`,
    `  src: url("${name}.woff2") format("woff2"),`,
    `       url("${name}.woff") format("woff"),`,
    `       url("${name}.ttf") format("truetype");`,
    `}`,
  ].join("\n");
}
