import fs from "fs-extra";
import path from "path";
import { Worker } from "worker_threads";
import { inflate } from "pako";
import { Font, FontEditor } from "fonteditor-core";
import { resolveChars, resolveOptions } from "./utils/options";
import { Options, InnerOptions } from "./utils/types";
import { runner, TasksData } from "./utils/runner";

/**
 * Transform the ttf file to woff/woff2.
 * Generate the css font-face
 * Split the font file
 */
export default async function fontPack(input: string, options: Options = {}) {
  const opts = await resolveOptions(input, options);
  const chars = await resolveChars(options);

  // create font
  const buffer = await fs.readFile(input);
  const font = Font.create(buffer, {
    type: opts.type as any,
    subset: chars,
    hinting: options.hinting,
    compound2simple: options.transform,
    inflate: (d) => inflate(Uint8Array.from(d)) as any, // for woff
  });

  const types = ["css", "ttf", "woff", "woff2"];

  // do not generate css file
  if (options.css === false) types.shift();

  generator(font, types, opts);

  // should split font
  if (chars) {
    const fullChars = Object.keys(font.get().cmap ?? {});
    const splitSet = new Set(fullChars.map(Number));
    chars.forEach((char) => splitSet.delete(char));
    const splitChars = Array.from(splitSet);

    const splitFont = Font.create(buffer, {
      type: opts.type as any,
      subset: splitChars,
      hinting: options.hinting,
      compound2simple: options.transform,
      inflate: (d) => inflate(Uint8Array.from(d)) as any, // for woff
    });

    const splitName = options.splitName || `${opts.name}-split`;

    generator(splitFont, types, { ...opts, name: splitName });
  }
}

async function generator(
  font: FontEditor.Font,
  types: string[],
  options: Omit<InnerOptions, "type">
) {
  if (types.includes("woff2")) {
    const buffer = font.write({ type: "ttf", toBuffer: true }) as any;

    const tasksData: TasksData = {
      buffer,
      tasks: [{ ...options, type: "woff2" }],
    };

    // woff2 runs on the worker
    new Worker(path.resolve(__dirname, "worker.js"), { workerData: tasksData });
  }

  // use font instance directly
  const tasks = types
    .filter((t) => t !== "woff2")
    .map((type) => ({ ...options, type }));

  runner({ tasks }, font);
}
