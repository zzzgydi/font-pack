import fs from "fs-extra";
import path from "path";
import wawoff2 from "wawoff2";
import ttf2woff from "./ttf2woff.js";

interface Options {
  outDir?: string;
}

export default async function fontPack(input: string, options: Options = {}) {
  if (!input) {
    throw new Error("invalid input file");
  }
  if (!input.toLowerCase().endsWith(".ttf")) {
    throw new Error("can only convert ttf");
  }

  const outDir = path.dirname(input);
  const fontName = path.basename(input).slice(0, -4);

  const buffer = await fs.readFile(input);

  // to woff
  const toWoff = async () => {
    const woff = ttf2woff(new Uint8Array(buffer));
    await fs.writeFile(path.join(outDir, `${fontName}.woff`), woff);
  };

  // to woff2
  const toWoff2 = async () => {
    const woff2 = await wawoff2.compress(buffer);
    await fs.writeFile(path.join(outDir, `${fontName}.woff2`), woff2, "binary");
  };

  return Promise.all([toWoff(), toWoff2()]);
}
