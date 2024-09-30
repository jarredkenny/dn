import type { Options } from "./options";

export async function openEditor(
  options: Options,
  path: string,
  line?: number,
) {
  const childProcess = Bun.spawn({
    cmd: [options.editor, path, line ? `+${line}` : ""],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await childProcess.exited;
}
