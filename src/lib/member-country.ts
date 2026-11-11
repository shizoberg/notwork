export type MemberCountry = "TR" | "DE";

export function memberCountry(value: unknown): MemberCountry | undefined {
  return value === "TR" || value === "DE" ? value : undefined;
}
