import { resolve } from "path";
import {
  readFile,
  writeFile,
  exists,
  rm,
  mkdir,
  readdir,
} from "node:fs/promises";

import { type Options } from "./options";

async function isEmptyDir(path: string): Promise<boolean> {
  const files = await readdir(path);
  return files.length === 0;
}

export function getNotePath(note: Options): string {
  return resolve(note.dnDir, note.date, note.fileName);
}

export async function readNote(note: Options): Promise<string> {
  return readFile(getNotePath(note), "utf8");
}

function defaultDailyNoteContent(options: Options): string {
  return `---
date: ${options.date}
title: ${options.title}
---

# ${options.title}

## TODO

- [ ]

## Notes
`;
}

function defaultTitledNoteContent(options: Options): string {
  return `---
date: ${options.date}
title: ${options.title}
---

# ${options.title}
`;
}

function defaultNoteContent(options: Options): string {
  return options.type === "titled"
    ? defaultTitledNoteContent(options)
    : defaultDailyNoteContent(options);
}

export async function initNote(options: Options) {
  mkdir(resolve(options.dnDir, options.noteDir), { recursive: true });
  const notePath = getNotePath(options);
  if (!(await exists(notePath))) {
    const content = defaultNoteContent(options);
    await writeFile(notePath, content);
  }
}

export async function cleanupNote(options: Options) {
  const defaultContent = defaultNoteContent(options);
  const noteContent = await readNote(options);
  const hasChanges = defaultContent !== noteContent;
  if (!hasChanges) {
    await rm(getNotePath(options));
  }
  if (await isEmptyDir(options.noteDir)) {
    await rm(options.noteDir);
  }
}
