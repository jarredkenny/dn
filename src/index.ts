#! /usr/bin/env bun

import { getOptions, type Options } from "./options";
import {
  resolveNote,
  cleanupNote,
  initNote,
  getNotePath,
  searchNotes,
  chooseAndEditSearchResult,
} from "./note";
import { openEditor } from "./editor";
import { chooseAndEditTodo, getUnfinishedTodos, printTodos } from "./todo";

async function handleNoteMode(options: Options) {
  if (options.search) {
    const results = await searchNotes(options, options.search);
    if (options.choose) {
      await chooseAndEditSearchResult(options, results);
    } else {
      console.table(
        results.map((result) => ({
          File: result.note.fileName,
          Line: result.line,
          Match: result.match,
        })),
      );
    }
    return;
  } else {
    const note = resolveNote(options);
    await initNote(options, note);
    await openEditor(options, getNotePath(options, note));
    await cleanupNote(options, note);
  }
}

async function handleTodosMode(options: Options) {
  const todos = getUnfinishedTodos(options);
  if (!options.choose) {
    printTodos(options, todos);
  } else {
    chooseAndEditTodo(options, todos);
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
