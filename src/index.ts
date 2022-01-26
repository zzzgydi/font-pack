import fs from "fs-extra";
import path from "path";
import { Worker } from "worker_threads";
import { Options } from "./utils/types";
import { runner, TasksData } from "./utils/runner";
import { resolveChars, resolveOptions } from "./utils/options";

/**
 * Transform the ttf file to woff/woff2.
 * Generate the css font-face
 * Split the font file
 */
export default async function fontPack(input: string, options: Options = {}) {
  const opts = await resolveOptions(input, options);
  const chars = await resolveChars(options);

  // read buffer
  const buffer = await fs.readFile(input);
  const types = ["css", "ttf", "woff", "woff2"];

  // do not generate css file
  if (options.css === false) types.shift();

  // copy buffer
  let copyBuf: Buffer = null!;
  if (chars) {
    copyBuf = Buffer.from(buffer);
  }

  // generate the main font
  // may only contain chars
  generator({
    buffer,
    split: "set",
    tasks: types.map((type) => ({ ...opts, type })),
    fontOpts: {
      type: opts.type, // input font type
      subset: chars,
      hinting: options.hinting,
      compound2simple: options.transform,
    },
  });

  // should split font
  if (copyBuf) {
    const splitName = options.splitName || `${opts.name}-split`;
    generator({
      buffer: copyBuf,
      split: "sub",
      tasks: types.map((type) => ({ ...opts, type, name: splitName })),
      fontOpts: {
        type: opts.type, // input font type
        subset: chars,
        hinting: options.hinting,
        compound2simple: options.transform,
      },
    });
  }
}

async function generator(data: TasksData) {
  const { tasks } = data;
  const woff2Task = tasks.find((t) => t.type === "woff2");

  if (woff2Task) {
    const tasksData: TasksData = { ...data, tasks: [woff2Task] };

    // woff2 runs on the worker
    new Worker(path.resolve(__dirname, "worker.js"), { workerData: tasksData });
  }

  // generate another
  runner({ ...data, tasks: tasks.filter((t) => t.type !== "woff2") });
}
