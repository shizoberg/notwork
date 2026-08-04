import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";
const notificationRecipients = ["berk@carewithki.com", "berkaktas@windowslive.com"];

type StartupApplicationInput = {
  name?: string;
  email?: string;
  phone?: string;
  projectName?: string;
  stage?: string;
  projectSummary?: string;
  need?: string;
};

type StartupApplication = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  stage: string;
  projectSummary: string;
  need: string;
  sourcePath: string;
  notification: {
    recipients: string[];
    status: "sent" | "not_configured" | "failed";
    error?: string;
  };
};

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, maxLength)
    : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function textApplication(application: StartupApplication) {
  return [
    "Yeni Network Startup başvurusu geldi.",
    "",
    `İsim: ${application.name}`,
    `E-posta: ${application.email}`,
    `Telefon: ${application.phone || "(belirtilmedi)"}`,
    `Proje adı: ${application.projectName || "(belirtilmedi)"}`,
    `Aşama: ${application.stage}`,
    "",
    "Proje özeti:",
    application.projectSummary,
    "",
    "Aradığı destek / bağlantı:",
    application.need || "(belirtilmedi)",
    "",
    `Admin panel: https://notwork.me/admin`,
  ].join("\n");
}

function htmlApplication(application: StartupApplication) {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#071215">
      <h2>Yeni Network Startup başvurusu</h2>
      <p><strong>İsim:</strong> ${escape(application.name)}</p>
      <p><strong>E-posta:</strong> ${escape(application.email)}</p>
      <p><strong>Telefon:</strong> ${escape(application.phone || "(belirtilmedi)")}</p>
      <p><strong>Proje adı:</strong> ${escape(application.projectName || "(belirtilmedi)")}</p>
      <p><strong>Aşama:</strong> ${escape(application.stage)}</p>
      <h3>Proje özeti</h3>
      <p>${escape(application.projectSummary)}</p>
      <h3>Aradığı destek / bağlantı</h3>
      <p>${escape(application.need || "(belirtilmedi)")}</p>
      <p><a href="https://notwork.me/admin">Admin panelde görüntüle</a></p>
    </div>
  `;
}

async function sendNotification(application: StartupApplication) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "not_configured" as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.STARTUP_NOTIFICATION_FROM || "notwork <onboarding@resend.dev>",
      to: notificationRecipients,
      reply_to: application.email,
      subject: `Network Startup başvurusu: ${application.projectName || application.name}`,
      text: textApplication(application),
      html: htmlApplication(application),
    }),
  });

  if (!response.ok) {
    return {
      status: "failed" as const,
      error: (await response.text()).slice(0, 300),
    };
  }

  return { status: "sent" as const };
}

async function listApplications(store: ReturnType<typeof getStore>) {
  const { blobs } = await store.list({ prefix: "applications/" });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return (rows.filter(Boolean) as StartupApplication[]).sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  );
}

async function createApplication(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16_384) {
    return new Response("Payload too large", { status: 413 });
  }

  const input = (await request.json()) as StartupApplicationInput;
  const email = clean(input.email, 120).toLowerCase();
  const name = clean(input.name, 100);
  const projectSummary = clean(input.projectSummary, 2_000);

  if (!name || !isValidEmail(email) || !projectSummary) {
    return new Response("Ad soyad, geçerli e-posta ve proje özeti gerekli.", { status: 400 });
  }

  const now = new Date();
  const application: StartupApplication = {
    id: crypto.randomUUID(),
    createdAt: now.toISOString(),
    name,
    email,
    phone: clean(input.phone, 60),
    projectName: clean(input.projectName, 140),
    stage: clean(input.stage, 80) || "belirtilmedi",
    projectSummary,
    need: clean(input.need, 1_200),
    sourcePath: "/network-startup",
    notification: {
      recipients: notificationRecipients,
      status: "not_configured",
    },
  };

  const notification = await sendNotification(application);
  application.notification = { recipients: notificationRecipients, ...notification };

  const store = getStore({ name: "startup-applications", consistency: "strong" });
  await store.setJSON(`applications/${now.getTime()}-${application.id}.json`, application);
  return Response.json(
    { ok: true, id: application.id, notification: application.notification.status },
    { headers: { "cache-control": "no-store" } },
  );
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "list") {
      const { password } = (await request.json()) as { password?: string };
      if (!validPassword(password)) return new Response("Yetkisiz erişim", { status: 401 });

      const store = getStore({ name: "startup-applications", consistency: "strong" });
      return Response.json(
        { applications: await listApplications(store), recipients: notificationRecipients },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    return await createApplication(request);
  } catch (error) {
    console.error("startup application error", error);
    return new Response("Başvuru alınamadı", { status: 500 });
  }
};

export const config: Config = { path: "/api/startup-applications" };
