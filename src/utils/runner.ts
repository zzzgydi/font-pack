import fs from "fs-extra";
import path from "path";
import { inflate } from "pako";
import { Font, FontEditor } from "fonteditor-core";
import { InnerOptions } from "./types";
import * as Convert from "./convert";

export interface TasksData {
  buffer: Uint8Array;
  split: "set" | "sub" | "all";
  tasks: InnerOptions[];
  fontOpts: {
    type: string;
    subset?: number[];
    hinting?: boolean;
    compound2simple?: boolean;
  };
}

export async function runner(tasksData: TasksData) {
  const { buffer, split, tasks, fontOpts } = tasksData;

  let font: FontEditor.Font = null!;

  if (buffer && tasks.some((task) => task.type !== "css")) {
    if (split !== "sub" || !fontOpts.subset?.length) {
      font = Font.create(buffer.buffer, {
        ...fontOpts,
        inflate: (d: any) => inflate(Uint8Array.from(d)) as any,
      } as any);
    } else {
      // use excluded chars
      font = Font.create(buffer.buffer, {
        type: fontOpts.type as any,
        inflate: (d: any) => inflate(Uint8Array.from(d)) as any,
      });

      const subset = fontOpts.subset!;
      const fullChars = Object.keys(font.get().cmap ?? {});
      const splitSet = new Set(fullChars.map(Number));
      subset.forEach((char) => splitSet.delete(char));
      const splitChars = Array.from(splitSet);

      if (!splitChars.length) {
        console.log(`the font "${tasks[0].name}" is empty`);
        return;
      }
      // regenerate the split font
      font = Font.create(buffer.buffer, {
        ...(fontOpts as any),
        subset: splitChars,
        inflate: (d: any) => inflate(Uint8Array.from(d)) as any,
      });
    }
  }

  const promises = tasks.map(async (task) => {
    const fileName = `${task.name}.${task.type}`;
    const filePath = path.join(task.outDir, fileName);

    let content: any = null;

    switch (task.type) {
      case "css":
        content = await Convert.toCSS(task.name);
        break;
      case "ttf":
        content = await Convert.toTTF(font);
        break;
      case "woff":
        content = await Convert.toWoff(font);
        break;
      case "woff2":
        content = await Convert.toWoff2(font);
        break;
      default:
        throw new Error(`unsupport type ${task.type}`);
    }

    if (!content) {
      throw new Error(`failed to convert to ${task.type}`);
    }

    await fs.writeFile(filePath, content);
    font = null!;

    console.log(`Done ${fileName}`);
  });

  await Promise.all(promises);
}
