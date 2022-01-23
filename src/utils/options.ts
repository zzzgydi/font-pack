import fs from "fs-extra";
import path from "path";
import { InnerOptions, Options } from "./types";

export const FontTypes = ["ttf", "otf", "eot", "woff", "woff2", "svg"];

export async function resolveOptions(
  input: string,
  options: Options = {}
): Promise<InnerOptions> {
  if (!input) {
    throw new Error("invalid font path");
  }

  if (!(await fs.pathExists(input))) {
    throw new Error("the file does't exists");
  }

  const basename = path.basename(input);
  const fileNames = basename.split(".");
  const fontType = fileNames.pop();
  const name = options.name || fileNames.join(".");

  if (!FontTypes.includes(fontType)) {
    throw new Error(`unsupport font type "${fontType}"`);
  }

  // resolve outDir
  const dirname = path.dirname(input);
  const outDir = options.outdir || dirname;

  await fs.mkdirp(outDir);

  return { type: fontType, name, outDir };
}

export async function resolveChars(options: Options = {}) {
  // resolve split chars
  const subset: Set<number> = new Set();

  // resolve split by txt
  if (options.splitByTxt) {
    const splitPath = options.splitByTxt.trim();

    if (await fs.pathExists(splitPath)) {
      const chars = await fs.readFile(splitPath, "utf-8");

      for (let i = 0; i < chars.length; ++i) {
        subset.add(chars.charCodeAt(i));
      }
    } else {
      console.warn(`the split txt doesn't exists`);
    }
  }

  // resolve split by chars
  if (options.splitByChars) {
    const chars = options.splitByChars;

    for (let i = 0; i < chars.length; ++i) {
      subset.add(chars.charCodeAt(i));
    }
  }

  // sort
  const sublist = Array.from(subset);
  sublist.sort();

  return sublist.length ? sublist : undefined;
}
