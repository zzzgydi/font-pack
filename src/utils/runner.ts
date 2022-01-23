import fs from "fs-extra";
import path from "path";
import { Font, FontEditor } from "fonteditor-core";
import { InnerOptions } from "./types";
import * as Convert from "./convert";

export interface TasksData {
  buffer?: Uint8Array;
  tasks: InnerOptions[];
}

export async function runner(tasksData: TasksData, font?: FontEditor.Font) {
  const { buffer, tasks } = tasksData;

  if (buffer && !font && tasks.some((task) => task.type !== "css")) {
    font = Font.create(buffer.buffer, { type: "ttf" });
  }

  const promises = tasks.map(async (task) => {
    const fileName = `${task.name}.${task.type}`;
    const filePath = path.join(task.outDir, fileName);

    let content: any = null;
    console.log("running", task);
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
        throw new Error(`unsuppot type ${task.type}`);
    }

    if (!content) {
      throw new Error(`failed to convert to ${task.type}`);
    }

    return fs.writeFile(filePath, content);
  });

  await Promise.all(promises);
}
