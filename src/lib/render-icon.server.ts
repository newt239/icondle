import "@tanstack/react-start/server-only";

export const normalize = (
  icon: { body: string; height: number },
  label = "出題中のアイコン",
): string =>
  `<svg viewBox="0 0 100 100" role="img" aria-label="${label}"><g transform="scale(${100 / icon.height})">${icon.body}</g></svg>`;
