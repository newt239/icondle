export type ChangelogEntry = {
  version: string;
  date: string;
  items: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07-21",
    items: ["Icondleを公開しました。"],
    version: "1.0.0",
  },
];
