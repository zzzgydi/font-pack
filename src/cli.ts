#!/usr/bin/env node

import cac from "cac";
import { mkdirp } from "fs-extra";
import { version } from "../package.json";
import fontPack from "./lib";

const cli = cac("font-pack");

cli
  .command("[...files]", "ttf paths")
  .option(
    "-n, --name <name>",
    "rename the font name (only valid when input single file)"
  )
  .option(
    "-o, --outdir <outdir>",
    "set the output dir (default the file's dir)"
  )
  .option("--css", "generate the related css file")
  .option("--no-css", "do not generate the related css file")
  .action(async (files = [], options = {}) => {
    if (files.length > 1) {
      delete options.name;
    }

    if (options.outdir) {
      await mkdirp(options.outdir);
    }

    // options.css = options.;
    files.forEach(async (file: string) => {
      try {
        await fontPack(file, options);
        console.log(`[Info]: "${file}" done`);
      } catch (err: any) {
        console.error(`[Error]: ${err.message} -- ${file}`);
      }
    });
  });

cli.help();
cli.version(version);
cli.parse();
