import type { Options } from "./options";

export function getUnfinishedTodos(options: Options) {
  const cmd = ["grep", "-Ri", "\\- \\[ \\]", options.dnDir];
  const grep = Bun.spawnSync(cmd);
  const results = grep.stdout
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [path, content] = line.split(":");
      return {
        path,
        content,
      };
    });
  return results;
}
