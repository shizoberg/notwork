export const eventEntryLinks = {
  launchSpace: { code: "space1411", path: "/launch-space" },
} as const;

export function resolveEventEntry(code: string) {
  const normalized = code.trim().toLowerCase();
  return Object.values(eventEntryLinks).find((entry) => entry.code === normalized);
}
