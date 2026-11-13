import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { Readable } from "node:stream";
import { createHash } from "node:crypto";
import { functionSandbox } from "../tests/helpers/function-sandbox.mjs";
// This process never imports the production Netlify Blobs SDK. No cloud or paid AI calls.
process.env.NTW_AI_ENABLED = "false";
process.env.MEMBER_PROFILE_DATABASE = "demo";
process.env.MEMBER_PROFILE_STORE = "launch-space-local-profiles";
process.env.MEMBER_SOURCE_STORE = "launch-space-local-members";
const password = "LaunchSpaceDemo2026!";
process.env.ADMIN_PASSWORD_HASH = createHash("sha256").update(password).digest("hex");
process.env.LAUNCH_ADMIN_USERNAME = "launchspace";
process.env.LAUNCH_ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
process.env.LAUNCH_ADMIN_SECRET = "local-launch-space-admin-session-only";
const port = Number(process.env.LAUNCH_SPACE_PORT || 5211);
const upstream = process.env.LAUNCH_SPACE_VITE || "http://127.0.0.1:5210";
if (!["127.0.0.1", "localhost"].includes(new URL(upstream).hostname))
  throw Error("Yalnızca yerel Vite hedefi kullanılabilir");
const origin = `http://127.0.0.1:${port}`;
const persistDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.local/launch-space",
);
const sandbox = await functionSandbox({ adminPassword: password, persistDir });
const registry = await sandbox.load("_event-registry-store");
const { novemberEventDraft, novemberEventSlug } = await sandbox.loadLib("event-poll");
const event =
  (await registry.getEvent(novemberEventSlug)) || (await registry.createEvent(novemberEventDraft));
await registry.setPrimaryEvent(event.id);
const members = await sandbox.load("_member-profile-store");
const handlers = {};
for (const name of [
  "event-registry",
  "event-registry-admin",
  "event-network",
  "event-network-admin",
  "member-profile",
  "event-poll",
  "launch-admin",
  "analytics-admin",
  "event-flow",
  "event-flow-admin",
  "networking-admin",
  "member-profiles-admin",
  "event-wordcloud-admin",
  "five-admin",
  "post-event-survey",
])
  handlers[name] = (await sandbox.load(name)).default;
async function profile(name, email) {
  const p = await members.createAdminMemberProfile({ name, email });
  const session = await members.loginMemberProfile(
    email,
    p.created ? p.credentials[0].temporaryPassword : password,
  );
  await members.changeMemberPassword(session.token, password);
  return session.token;
}
await profile("Kayıtlı Deniz", "kayitli@demo.example.org");
const readyCookie = await profile("Hazır Ece", "hazir@demo.example.org");
const demoPeople = [
  ["Ece", "Hazır", "hazir@demo.example.org"],
  ["Ada", "Tasarım", "ada@demo.example.org"],
  ["Can", "Yazılım", "can@demo.example.org"],
  ["Deniz", "Üretim", "deniz@demo.example.org"],
  ["Eren", "İçerik", "eren@demo.example.org"],
  ["Elif", "Girişim", "elif@demo.example.org"],
  ["Bora", "Ürün", "bora@demo.example.org"],
  ["Selin", "İletişim", "selin@demo.example.org"],
  ["Ekin", "Araştırma", "ekin@demo.example.org"],
  ["Arda", "Topluluk", "arda@demo.example.org"],
  ["Duru", "Strateji", "duru@demo.example.org"],
];
for (let i = 1; i <= 24; i++) {
  demoPeople.push(["Katılımcı", String(i), `area-${i}@demo.example.org`]);
}
const network = await sandbox.load("_event-network-store");
const ctx = await sandbox.load("_event-product-context");
const existing = await ctx.runWithEventRequestContext(novemberEventSlug, "matchlab", () =>
  network.listRegistrations(network.getEventNetworkStore()),
);
for (const [i, p] of demoPeople.entries()) {
  if (existing.some((r) => r.profile.email === p[2])) continue;
  const r = await handlers["event-network"](
    new Request(origin + "/api/event-products/network", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(i === 0 ? { cookie: `notwork_profile_session=${readyCookie}` } : {}),
      },
      body: JSON.stringify({
        action: "register",
        event: novemberEventSlug,
        firstName: p[0],
        lastName: p[1],
        email: p[2],
        attendedEvent: novemberEventSlug,
        offers: [i % 2 ? "tasarım" : "yazılım"],
        intro: "Birlikte yeni fikirler üretmek ve farklı insanlarla tanışmak istiyorum.",
        offersDetail:
          "Proje deneyimimi paylaşabilir, ürün ve iletişim konularında destek verebilirim.",
        needs: "Yeni projeler için farklı alanlardan insanlarla tanışmak istiyorum.",
        needTag: "networking",
        eventConsent: true,
        aiAnalysisConsent: false,
        marketingOptIn: false,
        generalNetworkOptIn: false,
      }),
    }),
    {},
  );
  if (!r.ok) throw Error(await r.text());
}
if (process.argv.includes("--populate")) {
  const first = [
    "Ada",
    "Ege",
    "Elif",
    "Deniz",
    "Can",
    "Selin",
    "Bora",
    "Duru",
    "Ekin",
    "Arda",
    "İpek",
    "Mert",
    "Defne",
    "Ozan",
    "Aslı",
    "Kerem",
    "Yağmur",
    "Sarp",
    "Cem",
    "Nil",
  ];
  const last = ["Yıldız", "Deniz", "Kaya", "Güneş", "Aydın"];
  let rows = await ctx.runWithEventRequestContext(novemberEventSlug, "matchlab", () =>
    network.listRegistrations(network.getEventNetworkStore()),
  );
  for (let i = rows.length; i < 100; i++) {
    await ctx.runWithEventRequestContext(novemberEventSlug, "matchlab", () =>
      network.registerNetworkProfile(network.getEventNetworkStore(), {
        firstName: first[i % 20],
        lastName: last[Math.floor(i / 20) % 5],
        email: `launch-demo-${i}@demo.example.org`,
        attendedEvent: novemberEventSlug,
        offers: [["tasarım", "yazılım", "pazarlama", "girişimcilik", "içerik"][i % 5]],
        intro: "Yeni bağlantılarla birlikte üretmek isteyen örnek katılımcı.",
        offersDetail: "Deneyimimi ve fikirlerimi paylaşabilirim.",
        needs: "Farklı alanlardan proje ortaklarıyla tanışmak",
        needTag: "networking",
        eventConsent: true,
      }),
    );
  }
  const call = async (name, input) => {
    const r = await handlers[name](
      new Request(origin + "/api/local", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: novemberEventSlug, password, ...input }),
      }),
      {},
    );
    if (!r.ok) throw Error(await r.text());
    return r.json();
  };
  let poll = await call("event-poll", { action: "admin" });
  if (poll.total === 0)
    poll = await call("event-poll", {
      action: "configure",
      revision: poll.config.revision,
      questions: poll.config.questions.map((q) => ({ ...q, options: q.options.slice(0, 5) })),
    });
  poll = await call("event-poll", { action: "open", revision: poll.config.revision, isOpen: true });
  rows = await ctx.runWithEventRequestContext(novemberEventSlug, "matchlab", () =>
    network.listRegistrations(network.getEventNetworkStore()),
  );
  for (const [i, row] of rows.entries()) {
    const r = await ctx.runWithEventRequestContext(novemberEventSlug, "matchlab", () =>
      network.resumeNetworkProfile(
        network.getEventNetworkStore(),
        row.profile.email,
        row.profile.username,
      ),
    );
    await call("event-poll", {
      action: "submit",
      accessToken: r.accessToken,
      questionVersion: poll.config.questionVersion,
      answers: poll.config.questions.map((q, j) => q.options[(i * 7 + j * 3) % q.options.length]),
    });
  }
  poll = await call("event-poll", { action: "admin" });
  await call("event-poll", { action: "publish", revision: poll.config.revision, questionIndex: 0 });
  let match = await call("event-network-admin", { action: "startMatching" });
  while (match.matching.status === "running")
    match = await call("event-network-admin", { action: "processMatching" });
  console.log(
    `Demo ready: ${rows.length} named participants; ${poll.total} ballots; Match open; poll open; question 1 on stage.`,
  );
}
const routes = {
  "/api/launch-admin": "launch-admin",
  "/api/events/context": "event-registry",
  "/api/admin/events": "event-registry-admin",
  "/api/event-products/network": "event-network",
  "/api/admin/event-products/network": "event-network-admin",
  "/api/member-profile": "member-profile",
  "/api/event-products/poll": "event-poll",
  "/api/analytics/admin": "analytics-admin",
  "/api/events/flow": "event-flow",
  "/api/admin/events/flow": "event-flow-admin",
  "/api/networking/admin": "networking-admin",
  "/api/admin/member-profiles": "member-profiles-admin",
  "/api/admin/event-products/wordcloud": "event-wordcloud-admin",
  "/api/admin/event-products/five": "five-admin",
  "/api/post-event-survey": "post-event-survey",
};
function send(res, response) {
  res.statusCode = response.status;
  for (const [k, v] of response.headers)
    if (!["connection", "transfer-encoding", "content-length"].includes(k)) res.setHeader(k, v);
  if (response.body) Readable.fromWeb(response.body).pipe(res);
  else res.end();
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", origin);
    if (url.pathname === "/__launch-space") {
      res.setHeader("content-type", "text/html;charset=utf-8");
      res.end(
        `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Launch Space · yerel test</title><style>body{background:#0d0e10;color:#eef3f7;font:16px system-ui;max-width:700px;margin:50px auto;padding:24px;line-height:1.7}a{display:inline-block;color:#9bc8dc;padding:12px;border:1px solid #35373c;border-radius:14px;margin:5px}code{color:#d8c6ff}</style><h1>Launch Space · 14 Kasım 18.00</h1><p>Yalnızca yerel, ayrı demo verileri. Canlı veriye ve ücretli AI'ya bağlantı yok.</p><a href="/launch-space">Katılımcı ekranı</a><a href="/launch-space-kontrol">Organizatör</a><a href="/launch-space-sahne">Sahne</a><a href="/admin">Genel admin</a><p>Admin/test şifresi: <code>${password}</code></p><p>Profili var, etkinlik kaydı yok: <code>kayitli@demo.example.org</code><br>Profili ve etkinlik kaydı var: <code>hazir@demo.example.org</code><br>Şifre aynı. Yeni kayıt için farklı bir <code>@demo.example.org</code> adresi kullan.</p><p>Örnek katılımcılar hazır. Katılımcı kendi bilgilerini doldurunca admin “Herkes hazır · eşleştir” butonuna basar. Anketi ayrıca açıp sonuçları sahneye yayınla.</p><p>Veriler yalnızca bu bilgisayardaki .local/launch-space altında saklanır. Sunucu ve tarayıcı yeniden açıldığında demo kayıtları korunur.</p>`,
      );
      return;
    }
    if (routes[url.pathname]) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks);
      const headers = new Headers(req.headers);
      headers.delete("host");
      headers.delete("connection");
      send(
        res,
        await handlers[routes[url.pathname]](
          new Request(url, { method: req.method, headers, ...(body.length ? { body } : {}) }),
          {},
        ),
      );
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      res.writeHead(404);
      res.end("Yerel demoda bu API tanımlı değil");
      return;
    }
    send(
      res,
      await fetch(new URL(req.url || "/", upstream), {
        headers: { accept: req.headers.accept || "*/*" },
      }),
    );
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain;charset=utf-8" });
    res.end(e.message);
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Launch Space: ${origin}/__launch-space · event ${event.id}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => sandbox.cleanup().finally(() => process.exit(0))));
