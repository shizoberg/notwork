import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { functionSandbox } from "./helpers/function-sandbox.mjs";

// PLAYWRIGHT_MODULE may point to an existing bundled Playwright installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const sandbox = await functionSandbox();
const originalEnabled = process.env.NTW_AI_ENABLED;
process.env.NTW_AI_ENABLED = "false";
const base = process.env.EVENT_TEST_URL || "http://127.0.0.1:5189";
const eventId = "evt_9_ekim_2026";
const slug = "9-ekim-2026";
let browser;
try {
  const registry = await sandbox.load("_event-registry-store");
  await registry.ensureEventRegistrySeeded();
  const event = await registry.getEvent(eventId);
  Object.assign(event, { revision: 100, status: "live" });
  event.entry.isOpen = true;
  for (const product of Object.values(event.products))
    Object.assign(product, { enabled: true, visible: true, state: "live", dataMode: "live" });
  await registry.getEventRegistryStore().setJSON(`events/${eventId}.json`, event);
  const modules = Object.fromEntries(
    await Promise.all(
      [
        ["context", "event-registry"],
        ["flow", "event-flow"],
        ["network", "event-network"],
        ["five", "five"],
        ["profile", "member-profile"],
      ].map(async ([key, name]) => [key, (await sandbox.load(name)).default]),
    ),
  );
  const run = async (handler, body) => {
    const response = await handler(
      new Request(`${base}/api/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      {},
    );
    assert.ok(response.ok, await response.clone().text());
    return response.json();
  };
  const members = await sandbox.load("_member-profile-store");
  const account = await members.createAdminMemberProfile({
    name: "Existing Browser",
    email: "browser-0@example.org",
  });
  const session = await members.loginMemberProfile(
    "browser-0@example.org",
    account.credentials[0].temporaryPassword,
  );
  await members.changeMemberPassword(session.token, "Browser-fixture-password-123");
  for (let i = 0; i < 9; i++)
    await run(modules.network, {
      action: "register",
      event: eventId,
      firstName: "Demo",
      lastName: `Browser ${i}`,
      email: `browser-${i}@example.org`,
      offers: [i % 2 ? "yazılım" : "tasarım"],
      intro: "Merhaba",
      needs: "Yeni bağlantılar",
      offersDetail: "Birlikte üretim",
      needTag: "networking",
      attendedEvent: "ilk-etkinligim",
      eventConsent: true,
      generalNetworkOptIn: false,
    });
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  });
  const errors = [];
  const contexts = [];
  async function newPage() {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      deviceScaleFactor: 1,
    });
    contexts.push(context);
    await context.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.origin !== base) return route.abort();
      if (!url.pathname.startsWith("/api/")) return route.continue();
      const handler = url.pathname.includes("/events/context")
        ? modules.context
        : url.pathname.includes("/events/flow")
          ? modules.flow
          : url.pathname.endsWith("/network")
            ? modules.network
            : url.pathname.endsWith("/five")
              ? modules.five
              : url.pathname === "/api/member-profile"
                ? modules.profile
                : null;
      if (!handler)
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, members: [], reviews: [] }),
        });
      const headers = await req.allHeaders();
      const response = await handler(
        new Request(req.url(), {
          method: req.method(),
          headers,
          ...(req.method() === "POST" ? { body: req.postData() } : {}),
        }),
        {},
      );
      return route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: await response.text(),
      });
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.setDefaultTimeout(15000);
    return page;
  }
  await fs.mkdir("test-results/october", { recursive: true });
  const page = await newPage();
  await page.goto(`${base}/linkler?event=${slug}`);
  await page.getByRole("button", { name: "Sadece zorunlu", exact: true }).click();
  await page.getByRole("button", { name: /Profil oluştur/ }).click();
  await page.getByLabel("Ad", { exact: true }).fill("Yeni");
  await page.getByLabel("Soyad", { exact: true }).fill("Katılımcı");
  await page.getByLabel("E-posta", { exact: true }).fill("browser-new@example.org");
  await page.getByRole("combobox").selectOption("ilk-etkinligim");
  await page.getByRole("button", { name: "tasarım", exact: true }).click();
  await page.getByRole("button", { name: /Etkinlik sorularına geç/ }).click();
  for (const answer of ["Tasarımcıyım", "Prototip", "Birlikte üretim"]) {
    await page.locator("textarea").fill(answer);
    await page.getByRole("button", { name: "Devam et", exact: true }).click();
  }
  await page.getByRole("checkbox", { name: /KVKK Aydınlatma/ }).check();
  await page.getByRole("button", { name: /Temel deneyimle devam et/ }).click();
  await page.getByRole("button", { name: "Kaydı tamamla" }).click();
  await page.locator(".entry-app-step").first().waitFor();
  await page.reload();
  await page.getByRole("region", { name: "Profilim" }).waitFor();
  await page.screenshot({ path: "test-results/october/linkler-mobile.png", fullPage: true });
  await page.locator(".entry-app-step").filter({ hasText: "notwork match" }).click();
  await page.locator(".match-people article").first().waitFor();
  assert.equal(await page.locator(".match-people article").count(), 2);
  await page.locator(".ntw-ai-analysis").waitFor();
  await page.getByRole("button", { name: "Kodu büyüt", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("dialog").evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  const codeBounds = await page.getByRole("dialog").boundingBox();
  assert.ok(
    Math.abs(codeBounds.x) <= 1 &&
      Math.abs(codeBounds.y) <= 1 &&
      codeBounds.width >= 389 &&
      codeBounds.height >= 843,
    "Code dialog covers mobile viewport",
  );
  await page.screenshot({ path: "test-results/october/match-code-mobile.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.screenshot({ path: "test-results/october/match-mobile.png", fullPage: true });
  await page.goto(`${base}/five/live?eventId=${eventId}`);
  await page.getByRole("region", { name: "Five başlangıç seçenekleri" }).waitFor();
  await page.getByRole("button", { name: /Problemini yaz/ }).click();
  for (let field = 0; field < 4; field++) {
    await page
      .locator("form textarea")
      .nth(field)
      .fill("Yeni müşterilere ulaşmanın yolunu arıyorum");
  }
  await page.locator('form input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Problemi ekle", exact: true }).click();
  await page.getByRole("button", { name: "Kodu büyüt", exact: true }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "Kodu büyüt", exact: true }).waitFor();
  await page
    .locator(".event-route-transition, .five-thinking-overlay")
    .waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Kodu büyüt", exact: true }).click();
  await page.getByRole("dialog").evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  const fiveCodeBounds = await page.getByRole("dialog").boundingBox();
  assert.ok(
    Math.abs(fiveCodeBounds.x) <= 1 &&
      Math.abs(fiveCodeBounds.y) <= 1 &&
      fiveCodeBounds.height >= 843,
    "Five group code covers mobile viewport",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.screenshot({ path: "test-results/october/five-mobile.png", fullPage: true });
  assert.ok(await page.getByRole("region", { name: "Grup sohbeti" }).count());
  const login = await newPage();
  await login.goto(`${base}/linkler?event=${slug}`);
  await login.getByRole("button", { name: "Sadece zorunlu", exact: true }).click();
  await login.getByRole("button", { name: /^Giriş yap Kullanıcı/ }).click();
  await login.getByLabel("Kullanıcı adı veya e-posta").fill("browser-0@example.org");
  await login.getByLabel("Şifre", { exact: true }).fill("Browser-fixture-password-123");
  await login.getByRole("checkbox").check();
  await login.getByRole("button", { name: "Giriş yap ve devam et" }).click();
  await login.locator(".entry-app-step").first().waitFor();
  await login.locator(".entry-app-step").filter({ hasText: "notwork match" }).click();
  await login.locator(".match-people article").first().waitFor();
  await login.reload();
  await login.locator(".match-people article").first().waitFor();
  assert.deepEqual(errors, [], "No client runtime errors");
  for (const p of [page, login])
    assert.ok(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "No mobile horizontal overflow",
    );
  console.log(
    "PASS mobile browser: one-question registration, short answers, completion, reload persistence, Match entry + group + analysis + enlarged code, Five problem submission + retained table/chat, existing-profile login + reload. No external data writes.",
  );
} finally {
  await browser?.close();
  if (originalEnabled === undefined) delete process.env.NTW_AI_ENABLED;
  else process.env.NTW_AI_ENABLED = originalEnabled;
  await sandbox.cleanup();
}
