type FrontmatterKey = string;
type FrontmatterValue = string | number | boolean | null;

export type Frontmatter = Record<FrontmatterKey, FrontmatterValue>;

export function parseFrontmatter<T extends Frontmatter>(
  markdownText: string,
): Partial<T> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdownText.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatterContent = match[1];
  const frontmatter: Record<FrontmatterKey, FrontmatterValue> = {};

  frontmatterContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const value = valueParts.join(":").trim();
      if (!isNaN(Number(value))) {
        frontmatter[key.trim()] = Number(value) as FrontmatterValue;
      } else if (
        value.toLowerCase() === "true" ||
        value.toLowerCase() === "false"
      ) {
        frontmatter[key.trim()] = value.toLowerCase() === "true";
      } else {
        frontmatter[key.trim()] = value || null;
      }
    }
  });

  return frontmatter as Partial<T>;
}
