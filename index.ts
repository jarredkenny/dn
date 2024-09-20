#! /usr/bin/env bun

import { parseArgs } from "util";
import { resolve } from "path";
import { mkdir, exists, writeFile } from "node:fs/promises";

type Options = {
  type: "daily" | "titled";
  title: string;
  fileName: string;
  date: string;
  editor: string;
  dnDir: string;
  noteDir: string;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

function getNotePath(note: Options): string {
  return resolve(note.dnDir, note.date, note.fileName);
}

async function createDirectoryIfNotExists(path: string) {
  return mkdir(path, { recursive: true });
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

async function getOptions(): Promise<Options> {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      day: {
        type: "string",
        default: "0",
      },
      dir: {
        type: "string",
        default: Bun.env.DN_DIR,
      },
      editor: {
        type: "string",
        default: Bun.env.DN_EDITOR ?? Bun.env.EDITOR,
      },
    },
    allowPositionals: true,
  });
  if (!values.editor) {
    throw new Error("No editor specified. $EDITOR or $DN_EDITOR must be set.");
  }
  if (!values.dir) {
    throw new Error("No directory specified. $DN_DIR must be set.");
  }

  await createDirectoryIfNotExists(values.dir);

  const date = formatDate(addDays(new Date(), parseInt(values.day ?? "0")));
  const titleArg = positionals.slice(2).join(" ").trim();
  const title = titleArg.length > 0 ? titleArg : date;
  const fileName =
    titleArg.length > 0 ? `${date}-${slugify(titleArg)}.md` : `${date}.md`;

  return {
    type: titleArg.length > 0 ? "titled" : "daily",
    title,
    date,
    fileName,
    editor: values.editor,
    noteDir: resolve(values.dir, date),
    dnDir: values.dir,
  };
}

async function initNote(options: Options) {
  createDirectoryIfNotExists(resolve(options.dnDir, options.noteDir));
  const notePath = getNotePath(options);
  if (!(await exists(notePath))) {
    const content = defaultNoteContent(options);
    await writeFile(notePath, content);
  }
}

async function openEditor(options: Options) {
  const childProcess = Bun.spawn({
    cmd: [options.editor, getNotePath(options)],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await childProcess.exited;
}

async function main() {
  const options = await getOptions();
  await initNote(options);
  await openEditor(options);
}

main();
