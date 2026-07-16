import "@tanstack/react-start/server-only";

export const normalize = (icon: { body: string; height: number }): string =>
  `<svg viewBox="0 0 100 100" role="img" aria-label="出題中のアイコン"><g transform="scale(${100 / icon.height})">${icon.body}</g></svg>`;
