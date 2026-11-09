import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = process.env.LAUNCH_SPACE_URL || "http://127.0.0.1:5211";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw Error("This test is local only");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
async function newContext() {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript(() =>
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })),
  );
  return c;
}
try {
  const initialPoll = await fetch(base + "/api/event-products/poll", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event: "14-kasim-2026",
      action: "admin",
      password: "LaunchSpaceDemo2026!",
    }),
  }).then((r) => r.json());
  assert.equal(initialPoll.database.mode, "demo");
  await fetch(base + "/api/event-products/poll", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event: "14-kasim-2026",
      action: "reset",
      revision: initialPoll.config.revision,
      password: "LaunchSpaceDemo2026!",
    }),
  });
  const c = await newContext();
  const p = await c.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(base + "/launch-space");
  await p.getByRole("button", { name: "Etkinlik profilimi oluştur" }).waitFor();
  assert.equal(await p.locator(".mobile-glass-dock").count(), 0);
  await p.screenshot({ path: "/tmp/launch-space-welcome-mobile.png" });
  await p.getByRole("button", { name: "Etkinlik profilimi oluştur" }).click();
  await p.getByLabel("Adın", { exact: true }).fill("Yeni");
  await p.getByLabel("Soyadın", { exact: true }).fill("Deneyim");
  await p
    .getByLabel("E-posta", { exact: true })
    .fill(`demo-browser-${Date.now()}@demo.example.org`);
  await p.getByRole("button", { name: "Devam et", exact: true }).click();
  const texts = [
    "İletişim ve tasarım alanında yeni fikirleri keşfetmek istiyorum.",
    "Ürün tasarımı ve içerik konusunda deneyim paylaşabilirim.",
    "Yeni projelerde birlikte çalışabileceğim insanlarla tanışmak istiyorum.",
  ];
  for (const text of texts) {
    await p.locator("textarea").fill(text);
    await p.getByRole("button", { name: "Devam et", exact: true }).click();
  }
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: "Kaydı tamamla", exact: true }).click();
  await p.getByRole("navigation", { name: "Etkinlik uygulamaları" }).waitFor();
  await p.locator(".ls-completion").waitFor({ state: "hidden" });
  assert.equal(await p.locator(".ls-person").count(), 1);
  await p.screenshot({ path: "/tmp/launch-space-home-mobile.png" });
  await p.getByRole("button", { name: "Match", exact: true }).click();
  await p.locator(".ls-center, .ls-match-heading").first().waitFor();
  // Fill any remainder with reserved local fixtures so this walkthrough always has a full group.
  const list = await fetch(base + "/api/admin/event-products/network", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event: "14-kasim-2026",
      action: "list",
      password: "LaunchSpaceDemo2026!",
    }),
  }).then((r) => r.json());
  for (let i = 0; i < (3 - (list.registrations.length % 3)) % 3; i++) {
    const resp = await fetch(base + "/api/event-products/network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "14-kasim-2026",
        action: "register",
        firstName: "Demo",
        lastName: "Tamamlayıcı",
        email: `fill-${Date.now()}-${i}@demo.example.org`,
        offers: ["networking"],
        intro: "Yerel demo",
        offersDetail: "Fikir paylaşımı",
        needs: "Yeni bağlantılar",
        needTag: "networking",
        attendedEvent: "14-kasim-2026",
        eventConsent: true,
      }),
    });
    assert.equal(resp.status, 201);
  }
  const adminContext = await newContext(),
    admin = await adminContext.newPage();
  admin.on("pageerror", (e) => errors.push(e.message));
  await admin.goto(base + "/launch-space-kontrol");
  await admin.getByLabel("Admin şifresi").fill("LaunchSpaceDemo2026!");
  await admin.getByRole("button", { name: "Kontrol panelini aç" }).click();
  await admin.getByRole("button", { name: "Herkes hazır · eşleştir" }).click();
  await admin.getByRole("button", { name: "Anketi aç", exact: true }).waitFor();
  await admin.getByRole("button", { name: "Anketi aç", exact: true }).click();
  await admin.getByRole("button", { name: "Yanıt alımını durdur", exact: true }).waitFor();
  if (await p.getByRole("button", { name: "Tekrar kontrol et" }).count())
    await p.getByRole("button", { name: "Tekrar kontrol et" }).click();
  await p.getByRole("button", { name: "Grup adını büyüt" }).waitFor();
  const group = await p.locator(".ls-match-heading h1").innerText();
  assert.equal(await p.locator(".ls-members>div").count(), 3);
  await p.screenshot({ path: "/tmp/launch-space-match-mobile.png" });
  await p.getByLabel("Grubuna mesaj").fill("Merhaba, sahnenin yanında buluşalım");
  await p.getByRole("button", { name: "Gönder", exact: true }).click();
  await p.getByText("Merhaba, sahnenin yanında buluşalım", { exact: true }).waitFor();
  await p.getByRole("button", { name: "Alanım", exact: true }).click();
  await p.getByRole("button", { name: "Match", exact: true }).click();
  await p.getByRole("button", { name: "Grup adını büyüt" }).waitFor();
  assert.equal(await p.locator(".ls-match-heading h1").innerText(), group);
  await p.reload();
  await p.getByRole("navigation", { name: "Etkinlik uygulamaları" }).waitFor();
  await p.getByRole("button", { name: "Match", exact: true }).click();
  await p.getByRole("button", { name: "Grup adını büyüt" }).waitFor();
  assert.equal(await p.locator(".ls-match-heading h1").innerText(), group);
  await p.getByRole("button", { name: "Anket", exact: true }).click();
  await p.locator(".ls-options button").first().waitFor();
  for (let i = 0; i < 5; i++) {
    await p.locator(".ls-options button").first().click();
    if (i === 1) await p.screenshot({ path: "/tmp/launch-space-poll-mobile.png" });
    await p
      .getByRole("button", { name: i === 4 ? "Yanıtları gönder" : "Devam et", exact: true })
      .click();
  }
  await p.getByText("Senin sesin", { exact: false }).waitFor();
  await admin.getByRole("button", { name: "Sahneye ver", exact: true }).first().click();
  await admin.getByRole("button", { name: "Yayında", exact: true }).waitFor();
  const stage = await c.newPage();
  await stage.setViewportSize({ width: 1440, height: 900 });
  await stage.goto(base + "/launch-space-sahne");
  await stage.getByText("Bugün hangi dünyadan geliyorsun?", { exact: true }).waitFor();
  assert.equal(await stage.locator(".ls-stage").count(), 1);
  await stage.screenshot({ path: "/tmp/launch-space-stage-desktop.png" });
  const existing = await newContext(),
    q = await existing.newPage();
  await q.goto(base + "/launch-space");
  await q.getByRole("button", { name: "Notwork profilim var · giriş yap" }).click();
  await q.getByLabel("E-posta veya kullanıcı adı").fill("kayitli@demo.example.org");
  await q.getByLabel("Şifren").fill("LaunchSpaceDemo2026!");
  await q.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await q.getByText("Biraz senden bahsedelim.", { exact: true }).waitFor();
  const ready = await newContext(),
    r = await ready.newPage();
  await r.goto(base + "/launch-space");
  await r.getByRole("button", { name: "Notwork profilim var · giriş yap" }).click();
  await r.getByLabel("E-posta veya kullanıcı adı").fill("hazir@demo.example.org");
  await r.getByLabel("Şifren").fill("LaunchSpaceDemo2026!");
  await r.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await r.getByRole("navigation", { name: "Etkinlik uygulamaları" }).waitFor();
  for (const page of [p, admin, q, r])
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  const general = await adminContext.newPage();
  await general.goto(base + "/admin");
  await general.waitForLoadState("networkidle");
  await general.getByLabel("Şifre", { exact: true }).fill("LaunchSpaceDemo2026!");
  await general.getByRole("button", { name: "giriş yap", exact: true }).click();
  await general
    .getByRole("button", { name: /Etkinlikler/ })
    .first()
    .waitFor();
  await general
    .getByRole("button", { name: /Etkinlikler/ })
    .first()
    .click();
  await general.getByRole("region", { name: "Canlı anket yönetimi" }).waitFor();
  await general.getByRole("link", { name: "Launch Space demosunu aç ↗" }).waitFor();
  await general.screenshot({ path: "/tmp/launch-space-general-admin.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS browser: new event registration; existing profile with/without event record; progress; admin launch; private chat; group retained across apps/reload; five answers; published stage; mobile layout.",
  );
} finally {
  await browser.close();
}
