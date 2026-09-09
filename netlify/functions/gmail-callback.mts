import type { Config } from "@netlify/functions";
import { completeGmailConnection } from "./_gmail.mjs";
export default async (request: Request) => {
  const headers = {
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "content-type": "text/html; charset=utf-8",
    "set-cookie":
      "notwork_gmail_oauth=; Path=/api/admin/gmail; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  };
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers });
  try {
    const url = new URL(request.url);
    const cookie =
      (request.headers.get("cookie") || "")
        .split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith("notwork_gmail_oauth="))
        ?.slice("notwork_gmail_oauth=".length) || "";
    await completeGmailConnection(
      url.searchParams.get("state") || "",
      cookie,
      url.searchParams.get("code") || "",
    );
    return new Response(
      '<!doctype html><html lang="tr"><meta charset="utf-8"><h1>Gmail bağlandı</h1><p>berk@notwork.me artık gönderim için bağlı. Bu işlem e-posta göndermedi.</p><a href="/admin">Admin paneline dön</a></html>',
      { headers },
    );
  } catch {
    return new Response(
      '<!doctype html><html lang="tr"><meta charset="utf-8"><h1>Bağlantı tamamlanamadı</h1><p>Admin panelinden yeniden başla ve berk@notwork.me hesabıyla gerekli gönderim yetkisini ver.</p><a href="/admin">Admin paneline dön</a></html>',
      { status: 400, headers },
    );
  }
};
export const config: Config = { path: "/api/admin/gmail/callback" };
