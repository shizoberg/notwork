import { createHash, timingSafeEqual } from "node:crypto";
import type { Config } from "@netlify/functions";
import { collectContacts } from "./contacts-admin.mjs";
import {
  announcementStore,
  campaignId,
  defaultDraft,
  normalizeDraft,
  recordConsent,
  renderAnnouncement,
  type AnnouncementDraft,
} from "./_announcements.mjs";

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 20000)
    return new Response("Payload too large", { status: 413 });
  try {
    const input = (await request.json()) as {
      password?: string;
      action?: string;
      draft?: Partial<AnnouncementDraft>;
      email?: string;
      evidence?: string;
      previewName?: string;
    };
    const actual = Buffer.from(
      createHash("sha256")
        .update(input.password || "")
        .digest("hex"),
    );
    const expected = Buffer.from(
      process.env.ADMIN_PASSWORD_HASH ||
        "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee",
    );
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return new Response("Yetkisiz erişim", { status: 401 });
    const action = input.action || "load";
    if (!["load", "save", "consent"].includes(action))
      return new Response("Geçersiz işlem. Bu ekran yalnızca taslak hazırlar; e-posta göndermez.", {
        status: 400,
      });
    const store = announcementStore();
    if (action === "save")
      await store.setJSON(`drafts/${campaignId}.json`, {
        draft: normalizeDraft(input.draft || {}),
        updatedAt: new Date().toISOString(),
        status: "draft",
      });
    if (action === "consent") {
      const { contacts } = await collectContacts();
      if (!contacts.some((contact) => contact.email === input.email?.trim().toLowerCase()))
        throw new Error("Adres mevcut Notwork kişi listesinde bulunamadı.");
      await recordConsent(input.email || "", input.evidence || "", store);
    }
    const saved = (await store.get(`drafts/${campaignId}.json`, { type: "json" })) as {
      draft: AnnouncementDraft;
      updatedAt: string;
    } | null;
    const draft = normalizeDraft(saved?.draft || defaultDraft);
    const { contacts } = await collectContacts();
    const counts = { total: contacts.length, subscribed: 0, unknown: 0, unsubscribed: 0 };
    for (const contact of contacts) counts[contact.announcementConsent]++;
    return Response.json(
      {
        draft,
        html: renderAnnouncement(
          draft,
          "#taslak-onizleme",
          typeof input.previewName === "string" ? input.previewName.slice(0, 80) : "Berk",
        ),
        updatedAt: saved?.updatedAt || null,
        counts,
        providerConfigured: Boolean(process.env.RESEND_API_KEY),
        status: "draft",
      },
      { headers: { "cache-control": "no-store, private" } },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Taslak yüklenemedi", {
      status: 400,
    });
  }
};
export const config: Config = { path: "/api/admin/announcements" };
