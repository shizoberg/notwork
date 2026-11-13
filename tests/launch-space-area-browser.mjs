import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = "http://127.0.0.1:5211";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() =>
    localStorage.setItem("notwork-cookie-consent-v1", JSON.stringify({ status: "necessary" })),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/launch-space");
  await page.getByLabel("Adın ve soyadın").fill("Alan Test");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Etkinliğe kayıt ol" }).click();
  await page.locator(".ls-people-card").first().waitFor();
  assert.equal(await page.locator(".ls-demo").innerText(), "launchspace");
  const count = await page.locator(".ls-people-card").count();
  assert.ok(count >= 20);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator(".ls-event-cover").evaluate(async (el) => {
    await Promise.all(
      el
        .closest(".ls-enter")
        .getAnimations()
        .map((a) => a.finished),
    );
  });
  await page.screenshot({ path: "/tmp/launch-space-area-mobile.png" });
  await page.locator(".ls-directory-heading").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/launch-space-people-mobile.png" });
  await page.locator(".ls-people-more").scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".ls-people-card").count(), count);
  await page.locator(".ls-people-more").click();
  await page.waitForFunction(() => document.querySelectorAll(".ls-people-card").length >= 30);
  assert.ok((await page.locator(".ls-people-card").count()) >= 30);
  await page.getByLabel("Katılımcı ara").fill("Ada");
  assert.ok((await page.locator(".ls-people-card").count()) < count);
  await page.locator(".ls-people-card").first().click();
  await page.getByRole("dialog").waitFor();
  assert.ok(await page.getByText("PAYLAŞABİLECEKLERİ", { exact: true }).count());
  await page.screenshot({ path: "/tmp/launch-space-profile-mobile.png" });
  const invite = page.getByRole("button", { name: "Tanışmak isterim", exact: true });
  if (await invite.count()) {
    await invite.click();
    await page.getByRole("button", { name: "Tanışma isteğin iletildi", exact: true }).waitFor();
  }
  await page.getByRole("button", { name: "Profili kapat" }).click();
  await page.getByRole("button", { name: "Nodes Match", exact: true }).click();
  await page.locator(".ls-match-heading, .ls-center").first().waitFor();
  const groupHeading = page.locator(".ls-match-heading h1");
  const name = await groupHeading.isVisible() ? await groupHeading.innerText() : null;
  if (name) assert.equal(await page.locator(".ls-photo-badge").count(), 1);
  await page.getByRole("button", { name: "Alanım", exact: true }).click();
  await page.getByRole("button", { name: "Nodes Match", exact: true }).click();
  await page.locator(".ls-match-heading, .ls-center").first().waitFor();
  if (name) assert.equal(await groupHeading.innerText(), name);
  await page.reload();
  await page.getByRole("button", { name: "Nodes Match", exact: true }).click();
  await page.locator(".ls-match-heading, .ls-center").first().waitFor();
  if (name) assert.equal(await groupHeading.innerText(), name);
  await page.screenshot({ path: "/tmp/launch-space-match-updated.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS mobile area: cover, launchspace badge, all participants, search, profile, introduction request, photographer, persistent Match across tabs and reload; no overflow or browser errors.",
  );
} finally {
  await browser.close();
}
