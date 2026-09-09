import type { Config } from "@netlify/functions";
import { createHash } from "node:crypto";
import { announcementStore, recordMarketingPreference } from "./_announcements.mjs";

export default async (request: Request) => {
  const headers = { "cache-control": "no-store, private" };
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new Response("Geçersiz kaynak", { status: 403, headers });
  try {
    const raw = await request.text();
    if (raw.length > 4096) return new Response("İstek çok uzun", { status: 413, headers });
    const input = JSON.parse(raw);
    const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (input.website) return Response.json({ message: "Tercihin kaydedildi." }, { headers });
    if (
      !name ||
      name.length > 100 ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      return new Response("Adını ve geçerli e-posta adresini yazmalısın.", {
        status: 400,
        headers,
      });
    if (
      input.noticeRead !== true ||
      input.marketingOptIn !== true ||
      input.version !== "2026-09-09"
    )
      return new Response("Aydınlatma metnini okuyup duyuru tercihini ayrı olarak seçmelisin.", {
        status: 400,
        headers,
      });
    const store = announcementStore();
    const key = createHash("sha256").update(email).digest("hex");
    const previous = (await store.get(`public-preferences/${key}.json`, { type: "json" })) as {
      recordedAt: string;
    } | null;
    if (previous && Date.now() - Date.parse(previous.recordedAt) < 60000)
      return new Response("Tercihin kaydedildi. Yeniden göndermeden önce bir dakika bekle.", {
        status: 429,
        headers,
      });
    const record = await recordMarketingPreference(email, true, store);
    await store.setJSON(`public-preferences/${key}.json`, {
      ...record,
      name,
      source: "duyurular-public-form",
      noticeVersion: "2026-09-09",
      noticeRead: true,
      noticeText: "KVKK Aydınlatma Metni’ni okudum ve bilgilendirildim.",
    });
    return Response.json(
      {
        message:
          "Duyuru tercihin kaydedildi. E-posta adresin ve izin kaydın doğrulandıktan sonra duyurulara dahil edilebilirsin. Bu işlemle e-posta gönderilmedi.",
      },
      { headers },
    );
  } catch {
    return new Response("Tercihin kaydedilemedi. Lütfen yeniden dene.", { status: 400, headers });
  }
};
export const config: Config = { path: "/api/announcements/subscribe" };
