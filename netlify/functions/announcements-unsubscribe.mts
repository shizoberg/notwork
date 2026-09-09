import type { Config } from "@netlify/functions";
import { tokenEmail, unsubscribe, subscriptionStatus, recordConsent } from "./_announcements.mjs";
const headers = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store, private",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
};
function page(message: string, form = "") {
  return `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>notwork · E-posta tercihleri</title><body style="font-family:Arial;background:#edf4f3;color:#102327;padding:40px 20px"><main style="max-width:480px;margin:auto;padding:28px;background:white;border-radius:20px"><h1>notwork</h1><p>${message}</p>${form}</main></body></html>`;
}
export default async (request: Request) => {
  if (!["GET", "POST"].includes(request.method))
    return new Response("Method not allowed", { status: 405 });
  try {
    const token = new URL(request.url).searchParams.get("token") || "";
    const email = await tokenEmail(token);
    if (!email)
      return new Response(
        page("Bu bağlantı geçersiz. E-postandaki abonelikten çık bağlantısını kullan."),
        { status: 404, headers },
      );
    const wantsToContinue = new URL(request.url).searchParams.get("preference") === "subscribe";
    if (request.method === "GET" && wantsToContinue) {
      return new Response(
        page(
          "notwork etkinlik, bilet ve topluluk duyuruları için adının ve e-posta adresinin kullanılmasına ve e-posta ile ticari elektronik ileti almaya devam etmek istiyorsan tercihini onaylayabilirsin. Bu seçim isteğe bağlıdır ve hesabını etkilemez.",
          '<p><a href="/kvkk">KVKK aydınlatma metni</a> · <a href="/acik-riza">Açık rıza metni</a></p><form method="post"><label><input type="checkbox" name="consent" value="2026-09-09" required> Duyuru amaçlı veri işlemeye ve e-posta ile ticari elektronik ileti almaya izin veriyorum. Ücretsiz olarak istediğim zaman ayrılabilirim.</label><p><button name="confirm" value="subscribe">Duyuruları almaya devam et</button></p></form>',
        ),
        { headers },
      );
    }
    // GET is deliberately read-only: email security scanners must not unsubscribe recipients.
    if (request.method === "GET")
      return new Response(
        page(
          "notwork etkinlik duyurularını almak istemiyorsan aşağıdaki butonla çıkabilirsin. Üye hesabın etkilenmez.",
          '<form method="post"><button name="confirm" value="unsubscribe" style="padding:14px 24px;border:0;border-radius:24px;background:#65b5bb;font-weight:bold">Abonelikten çık</button></form>',
        ),
        { headers },
      );
    if (Number(request.headers.get("content-length") || 0) > 2048)
      return new Response("Payload too large", { status: 413 });
    const body = new URLSearchParams(await request.text());
    if (body.get("confirm") === "subscribe") {
      if (body.get("consent") !== "2026-09-09")
        return new Response("İsteğe bağlı izin seçimini işaretlemelisin.", {
          status: 400,
          headers,
        });
      if ((await subscriptionStatus(email)) !== "subscribed")
        return new Response(
          page(
            "Bu bağlantı mevcut duyuru iznini doğrulamak içindir. Yeni abonelik veya yeniden abonelik için berk@notwork.me adresinden iletişime geçebilirsin.",
          ),
          { status: 409, headers },
        );
      await recordConsent(
        email,
        "E-posta bağlantısında ayrı, boş başlayan kutuyla yeniden onay. Metin sürümü 2026-09-09: Duyuru amaçlı veri işlemeye ve e-posta ile ticari elektronik ileti almaya izin veriyorum. Ücretsiz olarak istediğim zaman ayrılabilirim.",
      );
      return new Response(
        page(
          "Tercihin kaydedildi. notwork duyurularını almaya devam edeceksin. İstediğin zaman e-postadaki abonelikten çık bağlantısını kullanabilirsin.",
        ),
        { headers },
      );
    }
    if (body.get("confirm") !== "unsubscribe" && body.get("List-Unsubscribe") !== "One-Click")
      return new Response("Geçersiz istek", { status: 400 });
    await unsubscribe(token);
    return new Response(
      page(
        "Abonelikten çıktın. Bundan sonraki notwork etkinlik duyuruları sana gönderilmeyecek. Üye hesabın aktif kalır.",
      ),
      { headers },
    );
  } catch {
    return new Response(page("İşlem tamamlanamadı. Lütfen yeniden dene."), {
      status: 503,
      headers,
    });
  }
};
export const config: Config = { path: "/api/announcements/unsubscribe" };
