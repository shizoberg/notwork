import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getStore } from "@netlify/blobs";
export const sender = "berk@notwork.me";
export const callbackUrl = "https://notwork.me/api/admin/gmail/callback";
export const mailStore = () => getStore({ name: "notwork-gmail", consistency: "strong" });
export const hash = (text: string) => createHash("sha256").update(text).digest("hex");
function encryptionKey() {
  const key = Buffer.from(process.env.GMAIL_TOKEN_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY 32 bayt base64 olmalı.");
  return key;
}
export function seal(value: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}
function unseal(value: string) {
  const data = Buffer.from(value, "base64"),
    cipher = createDecipheriv("aes-256-gcm", encryptionKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString("utf8");
}
export async function gmailStatus() {
  const missing = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GMAIL_TOKEN_ENCRYPTION_KEY"].filter(
    (key) => !process.env[key],
  );
  if (!missing.length) {
    try {
      encryptionKey();
    } catch {
      missing.push("GMAIL_TOKEN_ENCRYPTION_KEY (geçersiz)");
    }
  }
  const connection = (await mailStore().get("connection.json", { type: "json" })) as {
    email: string;
    connectedAt: string;
  } | null;
  return {
    configured: missing.length === 0,
    connected: missing.length === 0 && !!connection,
    email: connection?.email || null,
    missing,
    callbackUrl,
  };
}
async function googleToken(body: Record<string, string>) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      ...body,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Google yetkisi alınamadı. Gmail bağlantısını yenile.");
  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    scope?: string;
  }>;
}
export async function startGmailConnection() {
  if (!(await gmailStatus()).configured)
    throw new Error("Önce Google OAuth ortam değişkenlerini tamamla.");
  const state = randomBytes(32).toString("base64url"),
    verifier = randomBytes(48).toString("base64url");
  await mailStore().setJSON(`oauth/${hash(state)}.json`, {
    verifier,
    expiresAt: Date.now() + 600000,
  });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    login_hint: sender,
    state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  }).toString();
  return {
    url: url.toString(),
    cookie: `notwork_gmail_oauth=${state}; Path=/api/admin/gmail; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  };
}
export async function completeGmailConnection(state: string, cookieState: string, code: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || state !== cookieState || !code)
    throw new Error("Google bağlantı isteği geçersiz.");
  const store = mailStore(),
    key = `oauth/${hash(state)}.json`;
  const row = (await store.get(key, { type: "json" })) as {
    verifier: string;
    expiresAt: number;
  } | null;
  if (!row || row.expiresAt < Date.now())
    throw new Error("Google bağlantı isteğinin süresi doldu.");
  const claim = await store.setJSON(`${key}.used`, { at: Date.now() }, { onlyIfNew: true });
  if (!claim.modified) throw new Error("Bu bağlantı isteği zaten kullanıldı.");
  const token = await googleToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl,
    code_verifier: row.verifier,
  });
  const identity = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!identity.ok) throw new Error("Google hesabı doğrulanamadı.");
  const user = (await identity.json()) as { email?: string; email_verified?: boolean };
  if (user.email?.toLowerCase() !== sender || !user.email_verified)
    throw new Error("Yalnızca berk@notwork.me hesabını bağlayabilirsin.");
  if (
    !token.refresh_token ||
    !token.scope?.split(" ").includes("https://www.googleapis.com/auth/gmail.send")
  )
    throw new Error("Çevrimdışı e-posta gönderme yetkisini verip yeniden bağlan.");
  await store.setJSON("connection.json", {
    email: sender,
    refreshToken: seal(token.refresh_token),
    connectedAt: new Date().toISOString(),
  });
  await store.delete(key);
}
async function accessToken() {
  const connection = (await mailStore().get("connection.json", { type: "json" })) as {
    refreshToken: string;
  } | null;
  if (!connection) throw new Error("Önce Gmail hesabını bağla.");
  return (
    await googleToken({
      grant_type: "refresh_token",
      refresh_token: unseal(connection.refreshToken),
    })
  ).access_token;
}
export type Mail = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};
export function rawMessage(message: Mail) {
  const email = message.to[0];
  if (
    message.to.length !== 1 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
    /[\r\n]/.test(message.subject)
  )
    throw new Error("Geçersiz alıcı veya konu.");
  const boundary = "ntw-" + randomBytes(18).toString("hex");
  const header = (value: string) => {
    if (/[\r\n]/.test(value)) throw new Error("Geçersiz e-posta başlığı.");
    return value;
  };
  const wrap = (value: string) =>
    Buffer.from(value)
      .toString("base64")
      .match(/.{1,76}/g)
      ?.join("\r\n") || "";
  const lines = [
    `From: Berk <${sender}>`,
    `To: ${email}`,
    `Reply-To: ${sender}`,
    `Subject: =?UTF-8?B?${Buffer.from(message.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  for (const [key, value] of Object.entries(message.headers || {})) {
    if (!["List-Unsubscribe", "List-Unsubscribe-Post"].includes(key))
      throw new Error("Desteklenmeyen başlık");
    lines.push(`${key}: ${header(value)}`);
  }
  lines.push(
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap(message.text),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap(message.html),
    `--${boundary}--`,
    "",
  );
  return Buffer.from(lines.join("\r\n")).toString("base64url");
}
// Never retry a claimed operation: Gmail does not provide a send idempotency key.
// A network timeout might mean the message was accepted. Keep it for manual review.
export async function sendGmailOnce(id: string, message: Mail) {
  const raw = rawMessage(message),
    store = mailStore(),
    key = `outbox/${hash(id)}.json`;
  const token = await accessToken();
  const claimed = await store.setJSON(
    key,
    { id, to: message.to[0], status: "uncertain", startedAt: new Date().toISOString() },
    { onlyIfNew: true },
  );
  if (!claimed.modified) return { status: "already-attempted" };
  const limit = Math.min(500, Math.max(1, Number(process.env.GMAIL_DAILY_LIMIT) || 100));
  let slot = false;
  for (let i = 0; i < limit; i++) {
    if (
      (
        await store.setJSON(
          `quota/${new Date().toISOString().slice(0, 10)}/${i}`,
          { id },
          { onlyIfNew: true },
        )
      ).modified
    ) {
      slot = true;
      break;
    }
  }
  if (!slot) {
    await store.delete(key); // No Google send was attempted; allow continuing after quota reset.
    return { status: "blocked-limit" };
  }
  const suppressionStore = getStore({ name: "notwork-announcements", consistency: "strong" });
  if (
    await suppressionStore.get(`suppressions/${hash(message.to[0].trim().toLowerCase())}.json`, {
      type: "json",
    })
  ) {
    await store.setJSON(key, { id, to: message.to[0], status: "skipped" });
    return { status: "skipped" };
  }
  try {
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      await store.setJSON(key, {
        id,
        to: message.to[0],
        status: "failed",
        httpStatus: response.status,
      });
      return { status: "failed" };
    }
    const result = (await response.json()) as { id?: string };
    if (!result.id) return { status: "uncertain" };
    await store.setJSON(key, {
      id,
      to: message.to[0],
      status: "accepted",
      messageId: result.id,
      at: new Date().toISOString(),
    });
    return { status: "accepted" };
  } catch {
    return { status: "uncertain" };
  }
}
