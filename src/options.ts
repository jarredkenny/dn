import { mkdir } from "node:fs/promises";
import { resolve } from "path";
import { parseArgs } from "util";
import { addDays, formatDate } from "./date";
import { slugify } from "./string";

type RunMode = "note" | "todos";

export type Options = {
  mode: RunMode;
  type: "daily" | "titled";
  title: string;
  fileName: string;
  date: string;
  editor: string;
  dnDir: string;
  noteDir: string;
  choose: boolean;
};

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

export async function getOptions(): Promise<Options> {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      day: {
        type: "string",
        default: "0",
      },
      todos: {
        type: "boolean",
        default: false,
      },
      choose: {
        type: "boolean",
        default: false,
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

  mkdir(values.dir, { recursive: true });

  const date = formatDate(addDays(new Date(), parseInt(values.day ?? "0")));
  const titleArg = positionals.slice(2).join(" ").trim();
  const title = titleArg.length > 0 ? titleArg : date;
  const fileName =
    titleArg.length > 0 ? `${date}-${slugify(titleArg)}.md` : `${date}.md`;

  return {
    mode: values.todos ? "todos" : "note",
    type: titleArg.length > 0 ? "titled" : "daily",
    title,
    date,
    fileName,
    editor: values.editor,
    noteDir: resolve(values.dir, date),
    dnDir: values.dir,
    choose: !!values.choose,
  };
}
