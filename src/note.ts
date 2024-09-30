import { resolve } from "path";
import {
  readFile,
  writeFile,
  exists,
  rm,
  mkdir,
  readdir,
  rmdir,
} from "node:fs/promises";

import { type Options } from "./options";
import { slugify, titleCase } from "./string";

export type Note = {
  type: "titled" | "daily";
  title: string;
  day: string;
  fileName: string;
};

async function isEmptyDir(path: string): Promise<boolean> {
  const files = await readdir(path);
  return files.length === 0;
}

export function getNotePath(options: Options, note: Note): string {
  return resolve(options.dnDir, options.day, note.fileName);
}

export async function readNote(options: Options, note: Note): Promise<string> {
  return readFile(getNotePath(options, note), "utf8");
}

function defaultDailyNoteContent(title: string, day: string): string {
  return `---
date: ${day}
title: ${title}
---

# ${title}

## TODO

- [ ]

## Notes
`;
}

function defaultTitledNoteContent(title: string, day: string): string {
  return `---
date: ${day}
title: ${titleCase(title)}
---

# ${titleCase(title)}
`;
}

function defaultNoteContent(
  type: "titled" | "daily",
  title: string,
  day: string,
): string {
  return type === "titled"
    ? defaultTitledNoteContent(title, day)
    : defaultDailyNoteContent(title, day);
}

export function resolveNote(options: Options): Note {
  return {
    type: options.argString.length > 0 ? "titled" : "daily",
    title: options.argString,
    day: options.day,
    fileName:
      options.argString.length > 0
        ? `${options.day}-${slugify(options.argString)}.md`
        : `${options.day}.md`,
  };
}

export async function initNote(options: Options, note: Note) {
  mkdir(resolve(options.dnDir, note.day), { recursive: true });
  const notePath = getNotePath(options, note);
  if (!(await exists(notePath))) {
    const content = defaultNoteContent(note.type, note.title, note.day);
    await writeFile(notePath, content);
  }
}

export async function cleanupNote(options: Options, note: Note) {
  const defaultContent = defaultNoteContent(note.type, note.title, note.day);

  const noteContent = await readNote(options, note);
  const hasChanges = defaultContent !== noteContent;
  if (!hasChanges) {
    await rm(getNotePath(options, note));
  }
  if (await isEmptyDir(resolve(options.dnDir, note.day))) {
    await rmdir(resolve(options.dnDir, note.day));
  }
}
