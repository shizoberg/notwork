import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
const errors = [];
const writes = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (request.url().includes("/api/") && request.method() !== "GET") writes.push(request.url());
});
await page.addInitScript(() =>
  localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })),
);
try {
  await page.goto(`${process.env.DEMO_TEST_URL || "http://127.0.0.1:5199"}/demo`);
  await page.getByLabel("Otomatik turu durdur").click();
  const steps = page.getByRole("navigation", { name: "Demo adımları" });
  await page.getByLabel("Adın", { exact: true }).fill("Derya");
  await page.getByLabel("Ne sunabilirsin?").fill("Görsel tasarım");
  await page.getByRole("button", { name: "Demoya katıl" }).click();
  await page.getByRole("heading", { name: "Yerini aldın, Derya." }).waitFor();
  await page.getByRole("button", { name: "Örnek eşleşmeyi göster" }).click();
  assert.equal(await page.locator(".demo-person").count(), 3);
  assert.equal(await page.locator(".demo-person h3").first().textContent(), "Derya");
  await page.getByRole("button", { name: "Mert", exact: true }).click();
  assert.match(await page.locator(".demo-distance p").textContent(), /Mert/);
  const stage = await page.locator(".demo-stage").boundingBox();
  const proximity = await page.locator(".demo-proximity").boundingBox();
  assert.ok(proximity.x > stage.x + stage.width - 2, "Landscape proximity should be on the right");
  await page.screenshot({
    path: "/tmp/notwork-demo-landscape.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Grup adını büyüt" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "Grup sohbeti", exact: true }).click();
  await page.getByLabel("Grubuna örnek mesaj yaz").fill("Selam, ben de geliyorum");
  await page.getByRole("button", { name: "Mesaj gönder", exact: true }).click();
  await page
    .locator(".demo-bubble.is-self")
    .filter({ hasText: "Selam, ben de geliyorum" })
    .waitFor();
  await page.getByRole("button", { name: "Anı bırak", exact: true }).last().click();
  await page.getByRole("button", { name: "Örnek kareyi oluştur" }).click();
  await page.getByRole("button", { name: "Yeni gruba geç" }).click();
  await page.getByRole("heading", { name: "Fikrin peşindekiler" }).waitFor();
  assert.equal(await page.locator(".demo-bubble.is-self").count(), 0);
  for (const width of [375, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const name of ["Katıl", "Hazırlan", "Eşleş", "Tanış", "Anı bırak"]) {
      await steps.getByRole("button", { name: new RegExp(name) }).click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${width}px / ${name} overflow`,
      );
    }
  }
  await steps.getByRole("button", { name: /Eşleş/ }).click();
  await page.screenshot({
    path: "/tmp/notwork-demo-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/notwork-demo-portrait.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.clock.install();
  await page.getByLabel("Demoyu başa al").click();
  await page.clock.runFor(46000);
  await page.getByLabel("Otomatik turu durdur").click();
  await steps.getByRole("button", { name: /Eşleş/ }).click();
  await page.getByRole("heading", { name: "Fikrin peşindekiler" }).waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, [], "Demo must not write to production APIs");
  console.log(
    "PASS: 5 steps, registration, group rotation, private demo chat, sample photo, proximity selection, landscape right panel, portrait/desktop layout, automatic loop. No API writes.",
  );
} finally {
  await browser.close();
}
