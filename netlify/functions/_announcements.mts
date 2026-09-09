import { createHash, randomBytes } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const campaignId = "chill-chat-2026-09-17";
export const defaultDraft = {
  id: campaignId,
  greeting: "selam {{isim}}",
  subject: "17 eylül’de buluşalım mı? | notwork chill & chat",
  preheader: "Chill & Chat: yeni bağlantılar, kısa çözüm buluşmaları ve müzik.",
  body: "selam,\n\n17 eylül perşembe akşamı Köşk Alsancak’ta yeniden bir araya geliyoruz. bu kez gecenin adı chill & chat. biraz tanışalım, biraz birbirimizin ne yaptığını dinleyelim, bir fikre birlikte kafa yoralım; sonra da müzikle sohbetin devamını getirelim istiyorum.\n\nnotwork’te kurmaya çalıştığım şey, bir etkinliğe gelip birkaç kişiyle tanışmanın biraz ötesinde. birinin anlattığı problem başka birinin bildiği bir şeyle çözülebilsin, “ben de bununla uğraşıyorum” dediğimiz insanlarla karşılaşabilelim. o akşam başlayan bir sohbetin sonrasında da devam etmesi bence işin en güzel tarafı.\n\nbu gece bunun için iki farklı alanımız var:\n\nntw.match.lab\n“burada kiminle konuşsam?” kısmını biraz kolaylaştırıyoruz. neler yaptığın, paylaşabileceklerin ve aradığın bağlantılar üzerinden sana uygun kişilerle tanışabileceğin bir akış hazırladık. kendini anlatmak kadar karşındaki insanı dinlemek için de bir alan.\n\nntw.five\naklında bir problem, takıldığın bir konu ya da üzerine başka bir gözün bakmasını istediğin bir fikir varsa onu getir. beş dakikalık kısa buluşmalarda birbirimizin konularına birlikte bakacağız. bazen bir soruya başka birinin yaklaşımını duymak bile yeni bir yol açabiliyor.\n\nsonrasında DJ, müzik ve serbest sohbet var. bütün geceyi bir programa yetişmeye çalışarak geçirmeni istemiyorum; biraz da rahatça oturalım, konuşalım, tanıştığımız insanlarla sohbeti uzatalım.\n\ntek başına da gelebilirsin, bir arkadaşını da alıp gelebilirsin. ne yaptığını anlatmak için kusursuz bir sunuma ya da hazır bir projeye ihtiyacın yok. merak ettiğin bir konu, paylaşmak istediğin bir deneyim ya da sadece tanışma isteğiyle gelmen yeterli :)\n\n17 eylül 2026, perşembe\nkapı açılışı 20.00\nKöşk Alsancak, İzmir\n\ntek kişilik bilet 450 TL. bir arkadaşınla gelirsen iki kişilik bilet 800 TL, yani kişi başı 400 TL.\n\netkinliğin detaylarını ve bilet bağlantısını aşağıya bırakıyorum. aklına takılan bir şey varsa bu maile yanıt verebilirsin.\n\n17 eylül’de görüşelim :)",
  ctaLabel: "Etkinliği incele ve biletini al",
  ctaUrl:
    "https://notwork.me/17-eylul?utm_source=notwork&utm_medium=email&utm_campaign=chill_chat_20260917",
};
export type AnnouncementDraft = typeof defaultDraft;
export type SubscriptionStatus = "unknown" | "subscribed" | "unsubscribed";
export const announcementStore = () =>
  getStore({ name: "notwork-announcements", consistency: "strong" });
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function subscriptionStatus(
  email: string,
  store = announcementStore(),
): Promise<SubscriptionStatus> {
  const key = digest(normalizeEmail(email));
  if (await store.get(`suppressions/${key}.json`, { type: "json" })) return "unsubscribed";
  return (await store.get(`consents/${key}.json`, { type: "json" })) ? "subscribed" : "unknown";
}
export async function recordConsent(email: string, evidence: string, store = announcementStore()) {
  email = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || evidence.trim().length < 10)
    throw new Error("Geçerli e-posta ve izin kaynağı/açıklaması gerekli.");
  if ((await subscriptionStatus(email, store)) === "unsubscribed")
    throw new Error("Abonelikten çıkan kişi bu işlemle yeniden eklenemez.");
  await store.setJSON(`consents/${digest(email)}.json`, {
    email,
    evidence: evidence.trim().slice(0, 1000),
    recordedAt: new Date().toISOString(),
  });
}
// A public form does not prove control of an email address. Keep its affirmative
// preference out of the verified sending allowlist; withdrawal always wins.
export async function recordMarketingPreference(
  email: string,
  optedIn: boolean,
  store = announcementStore(),
) {
  email = normalizeEmail(email);
  const record = {
    email,
    optedIn,
    version: "2026-09-09",
    source: "linkler-form",
    recordedAt: new Date().toISOString(),
    verification: "unverified",
    text: "Adımın ve e-posta adresimin notwork etkinlik, bilet ve topluluk duyuruları için kullanılmasına ve bana e-posta ile ticari elektronik ileti gönderilmesine izin veriyorum. İzin isteğe bağlıdır; dilediğim zaman ücretsiz ayrılabilirim.",
  };
  await store.setJSON(
    `preferences/${digest(email)}/${randomBytes(16).toString("hex")}.json`,
    record,
  );
  if (!optedIn) {
    await store.setJSON(`suppressions/${digest(email)}.json`, {
      email,
      reason: "form-preference",
      updatedAt: record.recordedAt,
    });
  }
  return record;
}
export async function createUnsubscribeUrl(email: string, store = announcementStore()) {
  const token = randomBytes(32).toString("base64url");
  await store.setJSON(`tokens/${digest(token)}.json`, {
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
  });
  return `https://notwork.me/api/announcements/unsubscribe?token=${token}`;
}
export async function tokenEmail(token: string, store = announcementStore()) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const row = (await store.get(`tokens/${digest(token)}.json`, { type: "json" })) as {
    email: string;
  } | null;
  return row?.email || null;
}
export async function unsubscribe(token: string, store = announcementStore()) {
  const email = await tokenEmail(token, store);
  if (!email) return false;
  await store.setJSON(`suppressions/${digest(email)}.json`, {
    email,
    reason: "unsubscribe",
    updatedAt: new Date().toISOString(),
  });
  return true;
}
export function normalizeDraft(input: Partial<AnnouncementDraft>): AnnouncementDraft {
  const draft = { ...defaultDraft, ...input, id: campaignId };
  for (const [key, max] of [
    ["subject", 180],
    ["greeting", 200],
    ["preheader", 240],
    ["body", 10000],
    ["ctaLabel", 100],
    ["ctaUrl", 1000],
  ] as const) {
    if (typeof draft[key] !== "string" || !draft[key].trim() || draft[key].length > max)
      throw new Error("Taslak alanlarını ve uzunluklarını kontrol et.");
  }
  if (/[\r\n]/.test(draft.subject)) throw new Error("Konu tek satır olmalı.");
  const url = new URL(draft.ctaUrl);
  if (url.protocol !== "https:" || url.hostname !== "notwork.me")
    throw new Error("Buton güvenli bir notwork.me adresine gitmeli.");
  return draft;
}
export function personalizeDraft(draft: AnnouncementDraft, name = "") {
  const firstName =
    name
      .trim()
      .replace(/[\r\n\t]+/g, " ")
      .split(/\s+/)[0]
      ?.slice(0, 80) || "";
  const fill = (value: string) =>
    value
      .replaceAll("{{isim}}", firstName)
      .replace(/ +([,!?])/g, "$1")
      .trim();
  return {
    ...draft,
    greeting: fill(draft.greeting ?? defaultDraft.greeting),
    subject: fill(draft.subject),
    preheader: fill(draft.preheader),
    body: fill(draft.body)
      .replace(/^selam notwork[ ,]+/i, "")
      .replace(/^selam[,! ]*\n+/i, ""),
  };
}
export function renderAnnouncement(draft: AnnouncementDraft, unsubscribeUrl: string, name = "") {
  draft = personalizeDraft(draft, name);
  const preferenceUrl = unsubscribeUrl.startsWith(
    "https://notwork.me/api/announcements/unsubscribe?",
  )
    ? `${unsubscribeUrl}&preference=subscribe`
    : "#taslak-onizleme";
  const paragraphs = draft.body
    .split(/\n\n+/)
    .map(
      (part) =>
        `<p style="margin:0 0 20px;line-height:1.7">${escape(part).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(draft.subject)}</title></head><body style="margin:0;background:#edf4f3;color:#102327;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escape(draft.preheader)}</div><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:600px;background:white;border-radius:20px"><tr><td style="padding:36px 28px"><div style="font-size:28px;font-weight:bold;margin-bottom:24px">notwork<span style="color:#65b5bb">.</span></div><div style="margin:0 0 28px;padding:22px;background:#edf4f3;border:1px solid #b4d9da;border-radius:16px"><p style="font-size:17px;line-height:1.6;margin:0 0 16px;font-weight:bold">Bu tür e-postaları daha fazla almak istemiyorsan abonelikten çıkabilirsin</p><a href="${escape(unsubscribeUrl)}" style="display:block;text-align:center;padding:15px 18px;background:#102327;color:#fff;border-radius:12px;text-decoration:none;font-size:17px;font-weight:bold;margin-bottom:12px">Abonelikten çık</a><a href="${escape(preferenceUrl)}" style="display:block;text-align:center;padding:15px 18px;background:#65b5bb;color:#102327;border-radius:12px;text-decoration:none;font-size:16px;font-weight:bold">notwork community’nin parçası olmaya devam et</a><p style="font-size:12px;line-height:1.5;margin:12px 0 0;color:#536a6e">Bu seçim yalnızca duyuru e-postalarıyla ilgilidir. Abonelikten çıkman notwork üyeliğini etkilemez.</p></div>${draft.greeting ? `<p style="margin:0 0 20px;line-height:1.7">${escape(draft.greeting)}</p>` : ""}${paragraphs}<p style="margin:28px 0"><a href="${escape(draft.ctaUrl)}" style="display:inline-block;background:#65b5bb;color:#102327;padding:15px 22px;border-radius:30px;text-decoration:none;font-weight:bold">${escape(draft.ctaLabel)}</a></p><hr style="border:0;border-top:1px solid #e1e8e7"><p style="font-size:12px;line-height:1.7;color:#627273">Bu e-posta notwork etkinlik duyuruları içindir. Yanıtların doğrudan Berk’e ulaşır.<br>Çınarlı, 1572/1. Sk. No:33, Konak/İzmir<br>Bu tür notwork e-postalarını almak istemiyorsan <a href="${escape(unsubscribeUrl)}" style="color:#345d63;text-decoration:underline">abonelikten çık</a>.<br><a href="${escape(preferenceUrl)}" style="color:#345d63;text-decoration:underline">Duyuruları almaya devam et</a> · <a href="https://notwork.me/kvkk">KVKK aydınlatma metni</a></p></td></tr></table></td></tr></table></body></html>`;
}
export async function prepareMessage(
  email: string,
  draft: AnnouncementDraft,
  store = announcementStore(),
  recipientName = "",
) {
  draft = personalizeDraft(draft, recipientName);
  if ((await subscriptionStatus(email, store)) !== "subscribed") return null;
  const url = await createUnsubscribeUrl(email, store);
  return {
    from: "Berk · notwork <berk@notwork.me>",
    reply_to: "berk@notwork.me",
    to: [normalizeEmail(email)],
    subject: draft.subject,
    html: renderAnnouncement(draft, url),
    text: `Bu tür e-postaları almak istemiyorsan abonelikten çık: ${url}\nnotwork community’nin parçası olmaya devam et: ${url}&preference=subscribe\nBu seçim yalnızca duyuru e-postaları içindir, üyeliğini etkilemez.\n\n${draft.greeting}\n\n${draft.body}\n\n${draft.ctaLabel}: ${draft.ctaUrl}\n\nAbonelikten çık: ${url}\nDuyuruları almaya devam et: ${url}&preference=subscribe\nKVKK aydınlatma metni: https://notwork.me/kvkk`,
    headers: {
      "List-Unsubscribe": `<${url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
