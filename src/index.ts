#! /usr/bin/env bun

import { relative, dirname, basename } from "path";

import { getOptions, type Options } from "./options";
import { cleanupNote, initNote } from "./note";
import { openEditor } from "./editor";
import { getUnfinishedTodos } from "./todo";
import { choose } from "./choose";

async function handleNoteMode(options: Options) {
  await initNote(options);
  await openEditor(options);
  await cleanupNote(options);
}

async function handleTodosMode(options: Options) {
  const todos = getUnfinishedTodos(options);
  if (!options.choose) {
    console.log(
      todos
        .map(({ content }) => content)
        .map((line) => line.replace("- [ ] ", "").trim())
        .filter(Boolean)
        .join("\n"),
    );
  } else {
    const choice = choose(
      todos.map((result) => ({
        ...result,
        label: result.content,
        description: result.path,
      })),
    );
    if (!choice) {
      return;
    }
    const relativePath = relative(options.dnDir, choice.path);
    const noteDir = dirname(relativePath);
    const fileName = basename(relativePath);
    const note: Options = {
      ...options,
      noteDir,
      fileName,
    };
    await openEditor(note);
  }
}

async function main() {
  try {
    const options = await getOptions();

    switch (options.mode) {
      case "note":
        await handleNoteMode(options);
        break;
      case "todos":
        await handleTodosMode(options);
        break;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("[!] ", error.message);
    }
    process.exit(1);
  }
}

main();
