export const RANKS = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Mythical Honor",
  "Mythical Glory",
  "Mythical Immortal",
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Шинэ" },
  { value: "oldest", label: "Хуучин" },
  { value: "price_low", label: "Хямд үнэ" },
  { value: "price_high", label: "Өндөр үнэ" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
