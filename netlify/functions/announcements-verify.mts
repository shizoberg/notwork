import type { Config } from "@netlify/functions";
import { verificationToken, verifyEmail } from "./_email-verification.mjs";
const headers = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow",
  "content-security-policy": "default-src 'none'; form-action 'self'; frame-ancestors 'none'",
};
const page = (text: string, form = "") =>
  `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>notwork e-posta doğrulama</title><h1>notwork</h1><p>${text}</p>${form}<p><a href="/kvkk">KVKK Aydınlatma Metni</a> · <a href="/">Siteye dön</a></p></html>`;
export default async (request: Request) => {
  if (!["GET", "POST"].includes(request.method))
    return new Response("Method not allowed", { status: 405, headers });
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!(await verificationToken(token)))
    return new Response(
      page("Bağlantı geçersiz veya süresi dolmuş. Site üzerinden yeniden tercih kaydedebilirsin."),
      { status: 404, headers },
    );
  if (request.method === "GET")
    return new Response(
      page(
        "Adresini doğrulayarak sitede seçtiğin notwork etkinlik ve topluluk duyurularını e-posta ile alma tercihini tamamlayabilirsin. İstediğin zaman duyuru e-postasından ücretsiz ayrılabilirsin.",
        '<form method="post"><button name="confirm" value="verify">Adresimi doğrula ve duyuru tercihimi tamamla</button></form>',
      ),
      { headers },
    );
  const raw = await request.text();
  if (raw.length > 1024 || new URLSearchParams(raw).get("confirm") !== "verify")
    return new Response(page("Geçersiz istek."), { status: 400, headers });
  try {
    await verifyEmail(token);
    return new Response(page("E-posta adresin doğrulandı ve duyuru tercihin kaydedildi."), {
      headers,
    });
  } catch {
    return new Response(
      page(
        "Doğrulama tamamlanamadı. Bağlantı kullanılmış veya adres gönderime kapatılmış olabilir. Destek: berk@notwork.me",
      ),
      { status: 409, headers },
    );
  }
};
export const config: Config = { path: "/api/announcements/verify" };
