import { randomBytes } from "node:crypto";
import { gmailStatus, hash, sendGmailOnce } from "./_gmail.mjs";
import { announcementStore, subscriptionStatus, recordConsent } from "./_announcements.mjs";
export async function requestEmailVerification(email: string) {
  if (!(await gmailStatus()).connected) return "pending-connection";
  if ((await subscriptionStatus(email)) === "unsubscribed") return "suppressed";
  if ((await subscriptionStatus(email)) === "subscribed") return "already-verified";
  const store = announcementStore(),
    day = new Date().toISOString().slice(0, 10);
  const claim = await store.setJSON(
    `verification-requests/${day}/${hash(email)}`,
    { at: Date.now() },
    { onlyIfNew: true },
  );
  if (!claim.modified) return "already-requested";
  const token = randomBytes(32).toString("base64url");
  await store.setJSON(`verification-tokens/${hash(token)}.json`, {
    email,
    expiresAt: Date.now() + 86400000,
    version: "2026-09-09",
  });
  const url = `https://notwork.me/api/announcements/verify?token=${token}`;
  const result = await sendGmailOnce(`verify:${day}:${email}`, {
    to: [email],
    subject: "notwork e-posta tercihini doğrula",
    text: `notwork sitesinde bu adresle duyuru tercihi kaydedildi. İşlemi sen yaptıysan 24 saat içinde adresini doğrulayabilirsin: ${url}\nİşlemi sen yapmadıysan bu mesajı yok say. Doğrulama yapmadan duyuru listesine eklenmezsin. İletişim: berk@notwork.me`,
    html: `<html lang="tr"><meta charset="utf-8"><body><h1>notwork e-posta tercihini doğrula</h1><p>notwork sitesinde bu adresle duyuru tercihi kaydedildi. İşlemi sen yaptıysan aşağıdaki bağlantıyla 24 saat içinde doğrulayabilirsin.</p><p><a href="${url}">E-posta adresimi doğrula</a></p><p>İşlemi sen yapmadıysan bu mesajı yok say. Doğrulama yapmadan duyuru listesine eklenmezsin.</p><p><a href="https://notwork.me/kvkk">KVKK Aydınlatma Metni</a> · berk@notwork.me</p></body></html>`,
  });
  return result.status;
}
export async function verificationToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const row = (await announcementStore().get(`verification-tokens/${hash(token)}.json`, {
    type: "json",
  })) as { email: string; expiresAt: number; version: string } | null;
  return row && row.expiresAt > Date.now() ? row : null;
}
export async function verifyEmail(token: string) {
  const row = await verificationToken(token);
  if (!row) throw new Error("Bağlantı geçersiz veya süresi dolmuş.");
  if ((await subscriptionStatus(row.email)) === "unsubscribed")
    throw new Error("Bu adres gönderime kapalı. berk@notwork.me ile iletişime geçebilirsin.");
  const claim = await announcementStore().setJSON(
    `verification-used/${hash(token)}`,
    { at: new Date().toISOString() },
    { onlyIfNew: true },
  );
  if (!claim.modified) throw new Error("Bu doğrulama bağlantısı kullanılmış.");
  await recordConsent(
    row.email,
    `Sitede ayrı duyuru izni, ardından e-posta bağlantısında açık POST doğrulaması. İzin metni sürümü ${row.version}. Doğrulama: ${new Date().toISOString()}.`,
  );
}
