import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { getEvent } from "./_event-registry-store.mjs";
const slug = "14-kasim-2026";
export const launchCookie = "launch_admin_session";
function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function launchCredentials(username: unknown, password: unknown) {
  const expected = process.env.LAUNCH_ADMIN_PASSWORD_HASH || "";
  const account = process.env.LAUNCH_ADMIN_USERNAME || "";
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    expected.length === 64 &&
    account.length > 0 &&
    equal(username, account) &&
    equal(createHash("sha256").update(password).digest("hex"), expected)
  );
}
export function launchSession(eventId: string) {
  const secret = process.env.LAUNCH_ADMIN_SECRET;
  if (!secret || secret.length < 32) throw Error("Launch yönetici hesabı yapılandırılmadı");
  const payload = Buffer.from(JSON.stringify({ eventId, exp: Date.now() + 8 * 3600_000 })).toString(
    "base64url",
  );
  return payload + "." + createHmac("sha256", secret).update(payload).digest("base64url");
}
export async function hasLaunchSession(request: Request, identifier: string) {
  const secret = process.env.LAUNCH_ADMIN_SECRET;
  if (!secret || secret.length < 32) return false;
  const token =
    (request.headers.get("cookie") || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(launchCookie + "="))
      ?.slice(launchCookie.length + 1) || "";
  const [payload, sig] = token.split(".");
  if (
    !payload ||
    !sig ||
    !equal(sig, createHmac("sha256", secret).update(payload).digest("base64url"))
  )
    return false;
  try {
    const claim = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (claim.exp <= Date.now()) return false;
    const event = await getEvent(identifier);
    return Boolean(event && event.slug === slug && event.id === claim.eventId);
  } catch {
    return false;
  }
}
export const launchAdminSlug = slug;
