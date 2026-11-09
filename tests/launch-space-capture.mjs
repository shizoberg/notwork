import { chromium } from "playwright";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:5211",
  event = "14-kasim-2026",
  password = "LaunchSpaceDemo2026!";
const out = fileURLToPath(
  new URL("../../deliverables/launch-space-14-kasim/screenshots/", import.meta.url),
);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const shots = [];
async function context() {
  const c = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await c.addInitScript(() =>
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })),
  );
  return c;
}
async function shot(p, name) {
  await p.screenshot({ path: out + name + ".png", fullPage: true, animations: "disabled" });
  shots.push(name);
}
async function api(input) {
  const r = await fetch(base + "/api/event-products/poll", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, password, ...input }),
  });
  assert.equal(r.status, 200);
  return r.json();
}
try {
  const data = await fetch(base + "/api/admin/event-products/network", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, password, action: "list" }),
  }).then((r) => r.json());
  assert.equal(data.registrations.length, 100);
  assert.equal(data.matching.status, "open");
  let poll = await api({ action: "admin" });
  assert.equal(poll.total, 100);
  assert.ok(poll.config.isOpen);
  assert.ok(poll.config.questions.every((q) => q.options.length === 5));
  const c = await context(),
    p = await c.newPage();
  await p.goto(base + "/launch-space");
  await p.getByRole("button", { name: "Etkinlik profilimi oluştur" }).waitFor();
  await shot(p, "01-karsilama-mobil");
  await p.getByRole("button", { name: "Etkinlik profilimi oluştur" }).click();
  await shot(p, "02-kayit-kisisel-bilgiler");
  await p.getByLabel("Adın", { exact: true }).fill("Demo");
  await p.getByLabel("Soyadın", { exact: true }).fill("Katılımcı");
  await p.getByLabel("E-posta", { exact: true }).fill("preview@demo.example.org");
  await p.getByRole("button", { name: "Devam et", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await p
      .locator("textarea")
      .fill(
        [
          "Ürün tasarımı ve yaratıcı projelerle ilgileniyorum.",
          "Tasarım ve iletişim konularında destek verebilirim.",
          "Birlikte üretebileceğim insanlarla tanışmak istiyorum.",
        ][i],
      );
    await shot(p, `0${i + 3}-kayit-soru-${i + 1}`);
    await p.getByRole("button", { name: "Devam et", exact: true }).click();
  }
  await shot(p, "06-kayit-onay"); // Do not submit: keep exactly 100 demo participants.
  const c2 = await context(),
    u = await c2.newPage();
  await u.goto(base + "/launch-space");
  await u.getByRole("button", { name: "Notwork profilim var · giriş yap" }).click();
  await shot(u, "07-mevcut-profil-giris");
  await u.getByLabel("E-posta veya kullanıcı adı").fill("hazir@demo.example.org");
  await u.getByLabel("Şifren").fill(password);
  await u.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await u.getByRole("navigation", { name: "Etkinlik uygulamaları" }).waitFor();
  await shot(u, "08-kisisel-alan-mobil");
  await u.getByRole("button", { name: "Match", exact: true }).click();
  await u.getByRole("button", { name: "Grup adını büyüt" }).waitFor();
  await shot(u, "09-match-grup-ve-sohbet");
  await u.getByRole("button", { name: "Grup adını büyüt" }).click();
  await shot(u, "10-grup-adi-buyuk");
  await u.getByRole("button", { name: "Kapat", exact: true }).click();
  await u.getByRole("button", { name: "Anket", exact: true }).click();
  await u.getByText("Senin sesin", { exact: false }).waitFor();
  await shot(u, "11-anket-tamamlandi");
  // Visual preview only: use real questionnaire/options, hide own already-submitted flag locally.
  await u.route("**/api/event-products/poll", async (route) => {
    const input = route.request().postDataJSON();
    if (!input.action || input.action === "status") {
      const response = await route.fetch();
      const d = await response.json();
      await route.fulfill({ response, json: { ...d, submitted: false } });
    } else await route.continue();
  });
  await u.getByRole("button", { name: "Alanım", exact: true }).click();
  await u.getByRole("button", { name: "Anket", exact: true }).click();
  await u.locator(".ls-options button").first().waitFor();
  for (let i = 0; i < 5; i++) {
    await u
      .locator(".ls-options button")
      .nth(i % 5)
      .click();
    await shot(u, `12-${i + 1}-anket-soru-onizleme`);
    if (i < 4) await u.getByRole("button", { name: "Devam et", exact: true }).click();
  }
  await u.unroute("**/api/event-products/poll");
  const a = await c2.newPage();
  await a.setViewportSize({ width: 1440, height: 1000 });
  await a.goto(base + "/launch-space-kontrol");
  await a.getByLabel("Admin şifresi").fill(password);
  await a.getByRole("button", { name: "Kontrol panelini aç" }).click();
  await a.getByRole("button", { name: "Yanıt alımını durdur" }).waitFor();
  await shot(a, "13-organizator-100-kisi-anket");
  const stage = await c2.newPage();
  await stage.setViewportSize({ width: 1440, height: 1000 });
  for (let i = 0; i < 5; i++) {
    await a
      .getByRole("button", { name: "Sahneye ver", exact: true })
      .nth(i === 0 ? 0 : i - 1)
      .click(); // First question may already be published; API below selects exact index safely.
    poll = await api({ action: "admin" });
    poll = await api({ action: "publish", revision: poll.config.revision, questionIndex: i });
    await stage.goto(base + "/launch-space-sahne");
    await stage.getByText(poll.config.questions[i].title, { exact: true }).waitFor();
    await stage.getByRole("button", { name: "Kelime bulutu", exact: true }).click();
    await shot(stage, `14-${i + 1}-sahne-kelime-bulutu`);
    if (i === 0) {
      await stage.getByRole("button", { name: "Dağılımı göster" }).click();
      await shot(stage, "15-sahne-yuzde-dagilim");
    }
  }
  const general = await c2.newPage();
  await general.setViewportSize({ width: 1440, height: 1000 });
  await general.goto(base + "/admin");
  await general.waitForLoadState("networkidle");
  await general.getByLabel("Şifre", { exact: true }).fill(password);
  await general.getByRole("button", { name: "giriş yap", exact: true }).click();
  await general.getByRole("region", { name: "Canlı anket yönetimi" }).waitFor();
  await shot(general, "16-genel-admin-14-kasim");
  poll = await api({ action: "admin" });
  await api({ action: "publish", revision: poll.config.revision, questionIndex: 0 });
  await fs.writeFile(
    out + "manifest.json",
    JSON.stringify(
      {
        participants: 100,
        ballots: 100,
        questions: 5,
        optionsPerQuestion: 5,
        matching: "open",
        schedule: { event: "18.00", presentations: "19.00" },
        screenshots: shots,
        notes:
          "12-* images preview real question UI with only the submitted flag hidden in the browser; no extra vote or user was saved. All data local and synthetic.",
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${shots.length} screenshots; 100 users/100 ballots; five 5-option questions; admin publish + cloud/bars verified. First question left published.`,
  );
} finally {
  await browser.close();
}
