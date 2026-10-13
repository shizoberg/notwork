import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
const writes = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (request.url().includes("/api/") && request.method() !== "GET") writes.push(request.url());
});
await page.addInitScript(() => {
  try { localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })); } catch { /* Sandboxed demo has no storage access. */ }
});
try {
  await page.goto(`${process.env.DEMO_TEST_URL || "http://127.0.0.1:5199"}/demo2`);
  const app = page.frameLocator('iframe[title="Nodes by notwork · örnek uygulama"]');
  await app.getByRole("button", { name: "Nodes", exact: true }).click();
  await app.locator(".nodes-map").waitFor();
  await app.getByRole("button", { name: "Profil", exact: true }).click();
  await app.getByRole("textbox", { name: "Etkinlik kodu", exact: true }).fill("WRONG");
  await app.getByRole("button", { name: "Etkinliğe katıl", exact: true }).click();
  await app.getByRole("alert").filter({ hasText: "NTW2026" }).waitFor();
  await app.getByRole("textbox", { name: "Etkinlik kodu", exact: true }).fill("NTW2026");
  await app.getByRole("button", { name: "Etkinliğe katıl", exact: true }).click();
  await app.getByRole("button", { name: "Eşleşmeye başla", exact: true }).click();
  await app.getByRole("heading", { name: "Grubun hazır.", exact: true }).waitFor();
  await app.getByRole("button", { name: "Profil", exact: true }).click();
  await app.getByRole("button", { name: "Etkinliğe dön", exact: true }).click();
  await app.getByRole("heading", { name: "Grubun hazır.", exact: true }).waitFor();
  await app.getByRole("button", { name: "Grubumu bul", exact: true }).click();
  await app.getByRole("button", { name: "Bora", exact: true }).click();
  await app.getByText("Sol önünde", { exact: true }).waitFor();
  await page.screenshot({ path: "/tmp/notwork-demo2-mobile.png", animations: "disabled" });
  await app.getByRole("button", { name: "Grubumu buldum", exact: true }).click();
  await app.getByRole("button", { name: "Grup sohbeti", exact: true }).click();
  await app.getByRole("textbox", { name: "Mesajın", exact: true }).fill("Merhaba demo grubu");
  await app.getByRole("button", { name: "Mesaj gönder", exact: true }).click();
  await app.getByText("Merhaba demo grubu", { exact: true }).waitFor();
  await app.getByRole("button", { name: "Kapat", exact: true }).click();
  await app.getByRole("button", { name: "Görüşmeyi bitir", exact: true }).click();
  await app.getByRole("button", { name: "Tamamla", exact: true }).click();
  await app.getByRole("button", { name: "Nodes’a ekle", exact: true }).first().click();
  await app.getByRole("button", { name: "Eklendi ✓", exact: true }).waitFor();
  await app.getByRole("button", { name: "Profilime dön", exact: true }).click();
  await app.getByRole("button", { name: "Nodes", exact: true }).click();
  const frame = page.frames().find((item) => item.url().includes("/nodes-demo/"));
  assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await frame.waitForFunction(() => innerWidth === 1440);
  await page.screenshot({ path: "/tmp/notwork-demo2-desktop.png", animations: "disabled" });
  assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
  console.log("PASS: Community/Nodes/Profile, code validation, lobby, match, return without losing group, finder, chat, save connection. Mobile + desktop. No API writes.");
} finally {
  await browser.close();
}
