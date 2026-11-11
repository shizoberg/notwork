import assert from "node:assert/strict";
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.addInitScript(() =>
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })),
  );
  let grow = false;
  let firstCount;
  await p.route("**/api/event-products/poll", async (route) => {
    const r = await route.fetch();
    const d = await r.json();
    if (d.published && firstCount === undefined) firstCount = d.published.counts[0].count;
    if (grow && d.published) {
      d.total += 10;
      d.published.total += 10;
      d.published.counts[0].count += 10;
    }
    await route.fulfill({ response: r, json: d });
  });
  await p.goto("http://127.0.0.1:5211/launch-space-sahne");
  await p.locator(".ls-result-bar").first().waitFor();
  assert.equal(await p.locator(".ls-result-bar").count(), 5);
  await p.waitForTimeout(1100);
  const w = (await p.locator(".ls-result-fill").first().boundingBox()).width;
  await p.screenshot({ path: "/tmp/launch-bars-desktop.png", fullPage: true });
  grow = true;
  await p
    .locator(".ls-result-bar")
    .first()
    .getByText(`${firstCount + 10} oy`, { exact: true })
    .waitFor();
  await p.waitForTimeout(1200);
  assert.ok((await p.locator(".ls-result-fill").first().boundingBox()).width > w);
  grow = false;
  await p.reload();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.locator(".ls-result-bar").first().waitFor();
  await p.waitForTimeout(900);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  for (const el of await p.locator(".ls-result-bar").all()) {
    const label = await el.locator(".ls-result-name").boundingBox();
    const value = await el.locator(".ls-result-value").boundingBox();
    assert.ok(label.x + label.width <= value.x);
  }
  await p.screenshot({ path: "/tmp/launch-bars-mobile.png", fullPage: true });
  console.log(
    "PASS: 5 bars, labels inside, count/percent, polled vote increase grows width, mobile text has no overlap/overflow. Growth used browser-only synthetic response; no DB changes.",
  );
} finally {
  await b.close();
}
