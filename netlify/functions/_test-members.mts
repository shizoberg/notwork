// Only reserved test domains are evidence. Job titles containing “test” are not.
export function isTestMemberEmail(value: unknown) {
  if (typeof value !== "string") return false;
  const domain = value.trim().toLowerCase().split("@")[1] || "";
  return (
    domain === "test.notwork.local" ||
    domain === "notwork.test" ||
    domain === "example.com" ||
    domain.endsWith(".invalid")
  );
}
