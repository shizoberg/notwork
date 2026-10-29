import assert from "node:assert/strict";
import { chromium } from "playwright";
import { functionSandbox } from "./helpers/function-sandbox.mjs";
const base = process.env.TICKET_TEST_URL || "http://127.0.0.1:5203";
const cases = [
  {
    path: "/22-kasim",
    id: "notwork-sahne-2026-11-22",
    date: "22 Kasım 2026",
    name: "notwork Sahne",
    single: 600,
    duo: 1100,
    url: "https://www.biletimgo.com/etkinlik/notwork-sahne-basarisizlik-hikyeleri-network-etkinligi-32801",
  },
  {
    path: "/10-aralik",
    id: "notwork-fast-2026-12-10",
    date: "10 Aralık 2026",
    name: "notwork Fast",
    single: 450,
    duo: 800,
    url: "https://www.biletimgo.com/etkinlik/notwork-fast-hizli-networking-eventi-32802",
  },
];
const sandbox = await functionSandbox();
const store = await sandbox.load("_analytics-store");
const examples = cases.map((c, i) => ({
  id: String(i),
  timestamp: "2026-10-16T12:00:00Z",
  type: "ticket_click",
  path: c.path,
  sessionId: "synthetic",
  label: c.date + " bilet",
  target: c.url,
  value: 0,
  referrer: "",
  source: "",
  campaign: "",
  device: "mobile",
}));
const summary = store.summarizeEvents("2026-10-16", examples);
assert.equal(summary.ticketClicksByEvent.november22, 1);
assert.equal(summary.ticketClicksByEvent.december10, 1);
assert.equal(summary.ticketClicksByEvent.october11, 0);
assert.equal(summary.ticketClicksByEvent.september17, 0);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "accepted" }));
    window.__metaCalls = [];
    window.fbq = (...args) => window.__metaCalls.push(args);
  });
  // Run the real client trackers, but never send test analytics or pixels externally.
  await context.route("**/api/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        r.request().url().includes("event-reviews") ? [] : { ok: true, profile: null },
      ),
    }),
  );
  await context.route("https://connect.facebook.net/**", (r) => r.abort());
  await context.route("https://www.facebook.com/**", (r) => r.abort());
  await context.route("https://www.biletimgo.com/**", (r) => r.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const c of cases) {
    await page.goto(base + c.path);
    const primary = page.locator("#primary-ticket-cta");
    await primary.waitFor();
    assert.equal(await primary.getAttribute("href"), c.url);
    assert.equal(await primary.getAttribute("data-meta-content-id"), c.id);
    assert.equal(await primary.getAttribute("data-meta-ticket-price"), String(c.single));
    await page.waitForFunction(
      (id) =>
        window.__metaCalls.some((x) => x[1] === "ViewContent" && x[2]?.content_ids?.[0] === id),
      c.id,
    );
    await page.getByText("social networking event", { exact: true }).waitFor();
    // Exercise horizontal swipes and ensure vertical scrolling never changes slides.
    const hero = page.locator('[style*="touch-action"]');
    const imageSrc = () => hero.locator('img').first().getAttribute('src');
    const original = await imageSrc();
    const swipe = async (dx, dy) => hero.evaluate((el, delta) => {
      const touch = (x,y) => new Touch({identifier:1,target:el,clientX:x,clientY:y});
      el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(250,200)]}));
      el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch(250+delta[0],200+delta[1])]}));
    }, [dx,dy]);
    await swipe(5,120);
    assert.equal(await imageSrc(), original);
    await swipe(-150,5);
    await page.waitForFunction(src => document.querySelector('[style*="touch-action"] img')?.getAttribute('src') !== src, original);
    await swipe(150,5);
    await page.waitForFunction(src => document.querySelector('[style*="touch-action"] img')?.getAttribute('src') === src, original);
    await page.getByRole("button", { name: /İki kişilik/ }).click();
    await page.locator(`#primary-ticket-cta[data-meta-ticket-price="${c.duo}"]`).waitFor();
    const [popup] = await Promise.all([page.waitForEvent("popup"), primary.click()]);
    await popup.close();
    const calls = await page.evaluate(() => window.__metaCalls);
    const tickets = calls.filter((x) => x[1] === "TicketButtonClick");
    assert.equal(tickets.length, 1);
    assert.equal(tickets[0][0], "trackCustom");
    assert.equal(tickets[0][2].content_ids[0], c.id);
    assert.equal(tickets[0][2].event_date, c.date);
    assert.equal(tickets[0][2].ticket_price, c.duo);
    assert.equal(tickets[0][2].button_location, "purchase_panel");
    const checkout = calls.filter((x) => x[1] === "InitiateCheckout");
    assert.equal(checkout.length, 1);
    assert.equal(checkout[0][2].value, c.duo);
    assert.equal(checkout[0][2].num_items, 2);
    await page.locator("footer").last().scrollIntoViewIfNeeded();
    const floating = page.locator('[data-meta-button-location="floating_cta"]');
    await floating.waitFor();
    const [second] = await Promise.all([page.waitForEvent("popup"), floating.click()]);
    await second.close();
    assert.equal(
      await page.evaluate(
        () => window.__metaCalls.filter((x) => x[1] === "TicketButtonClick").length,
      ),
      2,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + c.path);
    await primary.waitFor();
    await primary.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/notwork-${c.path.slice(1)}-desktop.png`,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + c.path);
    await primary.waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.screenshot({
      path: `/tmp/notwork-${c.path.slice(1)}-mobile.png`,
      animations: "disabled",
    });
  }
  await page.goto(base + "/");
  await page.locator('.hero-upcoming a[href="/22-kasim"]').waitFor();
  assert.equal(await page.locator('.hero-upcoming a[href="/22-kasim"]').count(), 1);
  assert.equal(await page.locator('.hero-upcoming a[href="/10-aralik"]').count(), 1);
  await page.goto(base + "/etkinlikler");
  await page.waitForFunction(() => window.__metaCalls.some((x) => x[1] === "PageView"));
  await page.getByRole("button", { name: "Yaklaşan", exact: true }).click();
  await page.locator('button[aria-pressed="true"]').filter({ hasText: "Yaklaşan" }).waitFor();
  assert.equal(await page.locator('main a[href="/22-kasim"]').count(), 1);
  assert.equal(await page.locator('main a[href="/10-aralik"]').count(), 1);
  assert.equal(await page.locator('main a[href="/11-ekim"]').count(), 0);
  const noConsent = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await noConsent.addInitScript(() => {
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" }));
    window.__metaCalls = [];
    window.fbq = (...a) => window.__metaCalls.push(a);
  });
  await noConsent.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: '{"profile":null,"ok":true}' }),
  );
  await noConsent.route("https://www.biletimgo.com/**", (r) => r.abort());
  const q = await noConsent.newPage();
  await q.goto(base + cases[0].path);
  const [pop] = await Promise.all([
    q.waitForEvent("popup"),
    q.locator("#primary-ticket-cta").click(),
  ]);
  await pop.close();
  assert.equal(
    await q.evaluate(
      () =>
        window.__metaCalls.filter((x) =>
          ["TicketButtonClick", "InitiateCheckout", "ViewContent"].includes(x[1]),
        ).length,
    ),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: new ticket pages, prices, both CTAs, Meta custom conversion + checkout, consent, homepage/catalog links, event-specific admin analytics. No live analytics writes.",
  );
} finally {
  await browser.close();
  await sandbox.cleanup();
}
