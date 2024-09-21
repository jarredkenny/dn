import { getNotePath } from "./note";
import type { Options } from "./options";

export async function openEditor(options: Options) {
  const childProcess = Bun.spawn({
    cmd: [options.editor, getNotePath(options)],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await childProcess.exited;
}
