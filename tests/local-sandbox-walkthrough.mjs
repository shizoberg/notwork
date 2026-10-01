import assert from "node:assert/strict";
import fs from "node:fs/promises";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.EVENT_SANDBOX_URL || "http://127.0.0.1:5193";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const errors = [];
const pages = [];
const password = "NotworkDemo2026!";

async function page() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const result = await context.newPage();
  result.setDefaultTimeout(20_000);
  result.on("pageerror", (error) => errors.push(error.message));
  pages.push(result);
  await result.goto(`${base}/linkler?event=9-ekim-2026`);
  await result.getByRole("button", { name: "Sadece zorunlu", exact: true }).click();
  return result;
}

async function finishEventQuestions(target) {
  const next = target.getByRole("button", { name: /Etkinlik sorularına geç/ });
  if (await next.isVisible()) {
    if (!(await target.getByRole("button", { name: "tasarım", exact: true }).getAttribute("aria-pressed"))?.includes("true")) {
      await target.getByRole("button", { name: "tasarım", exact: true }).click();
    }
    await next.click();
  }
  for (const answer of ["Tasarım ve fikir", "Prototip oluşturma", "Yeni insanlarla üretim"]) {
    await target.locator("textarea").fill(answer);
    await target.getByRole("button", { name: "Devam et", exact: true }).click();
  }
  await target.getByRole("checkbox", { name: /KVKK Aydınlatma/ }).check();
  await target.getByRole("button", { name: /Temel deneyimle devam et/ }).click();
  await target.getByRole("button", { name: "Kaydı tamamla" }).click();
  await target.locator(".entry-profile-card").waitFor();
}

async function checkHome(target) {
  await target.locator(".entry-profile-card").waitFor();
  const steps = await target.locator(".entry-app-step .entry-app-copy strong").allInnerTexts();
  assert.deepEqual(steps, ["notwork match", "ntw.wordcloud", "Etkinlik Yorumu"]);
  assert.ok(await target.getByText("Bu akşamın akışı").isVisible());
  assert.ok(await target.locator(".entry-profile-card").isVisible());
}

try {
  await fs.mkdir("test-results/october", { recursive: true });
  const fresh = await page();
  await fresh.getByRole("button", { name: /Profil oluştur/ }).click();
  await fresh.getByLabel("Ad", { exact: true }).fill("Yeni");
  await fresh.getByLabel("Soyad", { exact: true }).fill("Ziyaretçi");
  await fresh.getByLabel("E-posta", { exact: true }).fill(`yeni-${Date.now()}@demo.example.org`);
  await fresh.getByRole("combobox").selectOption("ilk-etkinligim");
  await finishEventQuestions(fresh);
  await checkHome(fresh);
  await fresh.locator(".entry-completion").waitFor({ state: "detached" });
  await fresh.screenshot({ path: "test-results/october/sandbox-new-home.png", fullPage: true });
  await fresh.locator(".entry-app-step").filter({ hasText: "notwork match" }).click();
  await fresh.getByRole("region", { name: "Grup sohbeti" }).waitFor();
  assert.match(fresh.url(), /eslesme\?eventId=evt_9_ekim_2026/);
  assert.ok(await fresh.getByLabel("Grup sohbetine mesaj").isVisible());
  await fresh.getByLabel("Grup sohbetine mesaj").fill("Masada buluşalım");
  await fresh.getByRole("button", { name: "Mesaj gönder" }).click();
  await fresh.getByText("Masada buluşalım").waitFor();
  await fresh.reload();
  await fresh.getByText("Masada buluşalım").waitFor();
  await fresh.locator(".event-route-transition").waitFor({ state: "detached" });
  await fresh.screenshot({ path: "test-results/october/sandbox-match-chat.png", fullPage: true });
  await fresh.getByRole("button", { name: "Yeni eşleşme iste" }).click();
  await fresh.getByRole("dialog").getByText("Yeni kişilerle eşleşmek ister misin?").waitFor();
  const rotationResponse = fresh.waitForResponse(
    (response) =>
      response.url().includes("/api/event-products/network") &&
      response.request().postData()?.includes('"action":"rotateMatch"'),
  );
  await fresh.getByRole("dialog").getByRole("button", { name: "Evet, yeni eşleşme bul" }).click();
  assert.deepEqual(await (await rotationResponse).json(), { ok: true, released: true });
  await fresh.getByRole("dialog").waitFor({ state: "hidden" });

  const existing = await page();
  await existing.getByRole("button", { name: /^Giriş yap Kullanıcı/ }).click();
  await existing.getByLabel("Kullanıcı adı veya e-posta").fill("kayitli@demo.example.org");
  await existing.getByLabel("Şifre", { exact: true }).fill(password);
  await existing.getByRole("checkbox").check();
  await existing.getByRole("button", { name: "Giriş yap ve devam et" }).click();
  await existing.getByRole("button", { name: /Etkinlik sorularına geç/ }).waitFor();
  await finishEventQuestions(existing);
  await checkHome(existing);
  await existing.screenshot({ path: "test-results/october/sandbox-existing-home.png", fullPage: true });

  const ready = await page();
  await ready.getByRole("button", { name: /^Giriş yap Kullanıcı/ }).click();
  await ready.getByLabel("Kullanıcı adı veya e-posta").fill("hazir@demo.example.org");
  await ready.getByLabel("Şifre", { exact: true }).fill(password);
  await ready.getByRole("checkbox").check();
  await ready.getByRole("button", { name: "Giriş yap ve devam et" }).click();
  await checkHome(ready);
  await ready.reload();
  await checkHome(ready);
  await fetch(`${base}/__sandbox`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "action=advance",
  });
  await ready.reload();
  await ready.locator(".entry-app-step").filter({ hasText: "ntw.wordcloud" }).click();
  await ready.getByLabel("Cevabın").waitFor();
  assert.ok(await ready.getByText("11 Ekim notwork").isVisible());
  assert.deepEqual(errors, []);
  console.log("PASS local sandbox: new account, existing profile needing event answers, completed event profile, Match chat persistence, ordered event home, Wordcloud handoff.");
} finally {
  await browser.close();
}
