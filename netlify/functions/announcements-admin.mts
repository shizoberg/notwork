import { gmailStatus, startGmailConnection, mailStore, hash, sendGmailOnce } from "./_gmail.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Config } from "@netlify/functions";
import { collectContacts } from "./contacts-admin.mjs";
import {
  createUnsubscribeUrl,
  prepareMessage,
  personalizeDraft,
  subscriptionStatus,
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
    const raw = await request.text();
    if (raw.length > 20000) return new Response("Payload too large", { status: 413 });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return new Response("Geçersiz kaynak", { status: 403 });
    const input = JSON.parse(raw) as {
      password?: string;
      action?: string;
      draft?: Partial<AnnouncementDraft>;
      email?: string;
      evidence?: string;
      previewName?: string;
      operationId?: string;
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
    if (!["load", "save", "consent", "connectGmail", "test", "send"].includes(action))
      return new Response("Geçersiz işlem. Bu ekran yalnızca taslak hazırlar; e-posta göndermez.", {
        status: 400,
      });
    if (action === "connectGmail") {
      const connection = await startGmailConnection();
      return Response.json(
        { authorizeUrl: connection.url },
        { headers: { "set-cookie": connection.cookie, "cache-control": "no-store" } },
      );
    }
    const store = announcementStore();
    if (
      action === "save" &&
      (await mailStore().get(`campaigns/${campaignId}.json`, { type: "json" }))
    )
      throw new Error("Başlatılmış kampanyanın taslağı değiştirilemez.");
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
    let operation: { status: string } | null = null;
    const gmail = await gmailStatus();
    type Campaign = {
      draft: AnnouncementDraft;
      recipients: Array<{ email: string; name: string }>;
      createdAt: string;
    };
    const campaignKey = `campaigns/${campaignId}.json`;
    let campaign = (await mailStore().get(campaignKey, { type: "json" })) as Campaign | null;
    if (action === "test") {
      if (!gmail.connected) throw new Error("Gmail hesabını bağla.");
      if (!input.operationId || !/^[a-zA-Z0-9-]{16,80}$/.test(input.operationId))
        throw new Error("Test işlem kimliği gerekli.");
      const email = "berk@carewithki.com";
      if ((await subscriptionStatus(email)) === "unsubscribed")
        throw new Error("Test adresi gönderime kapalı.");
      const url = await createUnsubscribeUrl(email);
      const personal = personalizeDraft(draft, "Berk");
      operation = await sendGmailOnce(`test:${input.operationId}`, {
        to: [email],
        subject: `[TEST] ${personal.subject}`,
        html: renderAnnouncement(personal, url),
        text: `${personal.greeting}\n\n${personal.body}\n\n${personal.ctaUrl}\nAbonelikten çık: ${url}`,
      });
    }
    if (action === "send") {
      if (!gmail.connected) throw new Error("Gmail hesabını bağla.");
      if (!campaign) {
        const recipients = contacts
          .filter((contact) => contact.announcementConsent === "subscribed")
          .map((contact) => ({ email: contact.email, name: contact.names[0] || "" }));
        if (!recipients.length) throw new Error("Gönderime uygun izinli alıcı yok.");
        await mailStore().setJSON(
          campaignKey,
          { draft, recipients, createdAt: new Date().toISOString() },
          { onlyIfNew: true },
        );
        campaign = (await mailStore().get(campaignKey, { type: "json" })) as Campaign;
      }
      let processed = 0;
      for (const recipient of campaign.recipients) {
        const id = `${campaignId}:${recipient.email}`;
        if (await mailStore().get(`outbox/${hash(id)}.json`, { type: "json" })) continue;
        const message = await prepareMessage(
          recipient.email,
          campaign.draft,
          store,
          recipient.name,
        );
        if (!message) {
          await mailStore().setJSON(
            `outbox/${hash(id)}.json`,
            { id, status: "skipped" },
            { onlyIfNew: true },
          );
          continue;
        }
        operation = await sendGmailOnce(id, message);
        processed++;
        if (operation.status !== "accepted" && operation.status !== "already-attempted") break;
        if (processed >= 5) break;
      }
    }
    const progress = {
      total: campaign?.recipients.length || 0,
      accepted: 0,
      skipped: 0,
      attention: 0,
      remaining: 0,
    };
    for (const recipient of campaign?.recipients || []) {
      const row = (await mailStore().get(
        `outbox/${hash(`${campaignId}:${recipient.email}`)}.json`,
        { type: "json" },
      )) as { status: string } | null;
      if (!row) progress.remaining++;
      else if (row.status === "accepted") progress.accepted++;
      else if (row.status === "skipped") progress.skipped++;
      else progress.attention++;
    }
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
        providerConfigured: gmail.connected,
        gmail,
        operation,
        progress,
        campaignLocked: !!campaign,
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
