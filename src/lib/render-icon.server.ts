import "@tanstack/react-start/server-only";

export const normalize = (
  icon: { body: string; width: number; height: number },
  label = "出題中のアイコン",
): string => {
  const scale = 100 / Math.max(icon.width, icon.height);
  const tx = (100 - icon.width * scale) / 2;
  const ty = (100 - icon.height * scale) / 2;
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${label}"><g transform="translate(${tx} ${ty}) scale(${scale})">${icon.body}</g></svg>`;
};
