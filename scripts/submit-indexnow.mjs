import { readFile } from "node:fs/promises";

const host = "notwork.me";
const key = "9bccabb2f5c88753b2a5953b4e18bde1";
const keyLocation = `https://${host}/${key}.txt`;
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (!response.ok) {
  throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
}

console.log(`IndexNow accepted ${urlList.length} notwork URL(s).`);
