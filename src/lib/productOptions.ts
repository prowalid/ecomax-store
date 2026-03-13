export interface ProductOptionGroup {
  name: string;
  values: string[];
}

export type SelectedProductOptions = Record<string, string>;

export function normalizeProductOptions(input: unknown): ProductOptionGroup[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const name = typeof (group as { name?: unknown }).name === "string" ? (group as { name: string }).name.trim() : "";
      const values = Array.isArray((group as { values?: unknown[] }).values)
        ? (group as { values: unknown[] }).values
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean)
        : [];

      if (!name || values.length === 0) return null;
      return { name, values: Array.from(new Set(values)) };
    })
    .filter((group): group is ProductOptionGroup => Boolean(group));
}

export function normalizeSelectedOptions(input: unknown): SelectedProductOptions {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [String(key).trim(), typeof value === "string" ? value.trim() : ""])
      .filter(([key, value]) => key && value)
  );
}

export function formatSelectedOptions(options: SelectedProductOptions): string {
  const entries = Object.entries(normalizeSelectedOptions(options));
  if (entries.length === 0) return "";
  return entries.map(([key, value]) => `${key}: ${value}`).join("، ");
}

export function hasRequiredSelections(
  groups: ProductOptionGroup[],
  selected: SelectedProductOptions
): boolean {
  if (groups.length === 0) return true;
  const normalizedSelected = normalizeSelectedOptions(selected);
  return groups.every((group) => group.values.includes(normalizedSelected[group.name] || ""));
}

export function getFirstMissingSelection(
  groups: ProductOptionGroup[],
  selected: SelectedProductOptions
): ProductOptionGroup | null {
  if (groups.length === 0) return null;
  const normalizedSelected = normalizeSelectedOptions(selected);

  return (
    groups.find((group) => !group.values.includes(normalizedSelected[group.name] || "")) ?? null
  );
}
