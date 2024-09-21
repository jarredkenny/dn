import { createSelection } from "bun-promptx";

type RequiredOptionAttributes = {
  label: string;
  description: string;
};

export function choose<T extends RequiredOptionAttributes>(options: T[]) {
  const selection = createSelection(
    options.map((option) => ({
      text: option.label,
      description: option.description,
    })),
  );
  if (typeof selection.selectedIndex === "number") {
    return options[selection.selectedIndex];
  }
  return undefined;
}
