#! /usr/bin/env bun

import { parseArgs } from "util";
import { resolve } from "path";
import { mkdir, exists, writeFile, readFile, rm } from "node:fs/promises";

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

async function readNote(note: Options): Promise<string> {
  return readFile(getNotePath(note), "utf8");
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

function printUsageAndExit() {
  console.log(`
Usage: dn [options] [title]

Options:
  --day  The day offset for the notes date. Defaults to 0 (today)
  --dir  The directory to store the daily notes. Defaults to $DN_DIR environment variable
  --editor  The editor to use when creating a new note. Defaults to $DN_EDITOR then $EDITOR environment variables.
  --help  Print this help message

Examples:
  dn
  dn Standup Notes
  dn --day=-1
  dn some note title
  dn --day=2 reminders
  dn --editor=code standup notes
`);
  process.exit(0);
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
      help: {
        type: "boolean",
        default: false,
      },
    },
    allowPositionals: true,
  });
  if (values.help) {
    printUsageAndExit();
  }
  if (!values.editor) {
    throw new Error(
      "No editor specified. Provide via --editor argument or by setting either an $DN_EDITOR or $EDITOR environment variable.",
    );
  }
  if (!values.dir) {
    throw new Error(
      "No notes directory specified. Provide via --dir argument or by setting the $DN_DIR environment variable.",
    );
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

async function cleanupNote(options: Options) {
  const defaultContent = defaultNoteContent(options);
  const noteContent = await readNote(options);
  const hasChanges = defaultContent !== noteContent;
  if (!hasChanges) {
    await rm(getNotePath(options));
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
  try {
    const options = await getOptions();
    await initNote(options);
    await openEditor(options);
    await cleanupNote(options);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[!] ", error.message);
    }
    process.exit(1);
  }
}

main();
