import { basename, relative } from "path";
import type { Options } from "./options";
import { choose } from "./choose";
import { openEditor } from "./editor";

export type Todo = {
  path: string;
  line: number;
  content: string;
};

export function getUnfinishedTodos(options: Options) {
  const cmd = ["grep", "-Rin", "\\- \\[ \\]", options.dnDir];
  const grep = Bun.spawnSync(cmd);
  const results = grep.stdout
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [path, lineNumber, content] = line.split(":");
      const todo: Todo = {
        path,
        line: parseInt(lineNumber),
        content: content.replace("- [ ] ", "").trim(),
      };
      return todo;
    });
  return results;
}

export function printTodos(options: Options, todos: Todo[]) {
  console.table(
    todos.map((todo) => ({
      TODO: todo.content,
      File: basename(todo.path).replace(".md", ""),
      Line: todo.line,
    })),
  );
}

export function chooseAndEditTodo(options: Options, todos: Todo[]) {
  const choice = choose(
    todos.map((todo) => ({
      ...todo,
      label: `${basename(todo.path).replace(".md", "")}:${todo.line} - ${todo.content}`,
      description: "",
    })),
  );
  if (!choice) {
    return;
  }
  openEditor(options, choice.path, choice.line);
}
