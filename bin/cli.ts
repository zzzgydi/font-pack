#!/usr/bin/env node

import cac from "cac";
import path from "path";
import { version } from "../package.json";
import type { Options } from "../src/utils/types";

const cli = cac("font-pack");
const fontPack = require(path.resolve(__dirname, "./index.js")).default;

cli
  .command("[...files]", "font files")
  .option(
    "-n, --name <name>",
    "rename the font name (only valid when input single file)"
  )
  .option(
    "-o, --outdir <outdir>",
    "set the output dir (default the file's dir)"
  )
  .option("--split-name <splitName>", "set the split font name")
  .option("--split-txt <splitByTxt>", "set the split chars text path")
  .option("--split-chars <splitByChars>", "set the split chars string")
  .option("--css", "generate the related css file")
  .option("--no-css", "do not generate the related css file")
  .option("--hinting", "keep ttf hinting or not")
  .option("--no-hinting", "do not keep ttf hinting or not")
  .option("--transform", "transform compound glyph to simple")
  .option("--no-transform", "do not transform compound glyph to simple")
  .action(async (files = [], opts = {}) => {
    const options: Options = {
      name: opts.name,
      outdir: opts.outdir,
      css: opts.css,
      splitName: opts.splitName,
      splitByTxt: opts.splitTxt,
      splitByChars: opts.splitChars,
      hinting: opts.hinting,
      transform: opts.transform,
    };

    // not support specify name when enter more font
    if (files.length > 1) {
      delete opts.name;
    }

    files.forEach((file: string) => fontPack(file, options));
  });

cli.help();
cli.version(version);
cli.parse();
