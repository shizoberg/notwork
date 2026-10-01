import http from "node:http";
import { Readable } from "node:stream";
import { functionSandbox } from "../tests/helpers/function-sandbox.mjs";

// Never use production Blobs or the paid AI endpoint in this local walkthrough.
process.env.NTW_AI_ENABLED = "false";
const port = Number(process.env.EVENT_SANDBOX_PORT || 5193);
const upstream = process.env.EVENT_SANDBOX_VITE || "http://127.0.0.1:5192";
if (!["127.0.0.1", "localhost"].includes(new URL(upstream).hostname)) {
  throw new Error("Yerel test yalnızca bu bilgisayardaki Vite sunucusuna bağlanır");
}
const origin = `http://127.0.0.1:${port}`;
const eventId = "evt_9_ekim_2026";
const slug = "9-ekim-2026";
const password = "NotworkDemo2026!";
const sandbox = await functionSandbox();
const registry = await sandbox.load("_event-registry-store");
const flow = await sandbox.load("_event-flow-store");
const members = await sandbox.load("_member-profile-store");
await registry.ensureEventRegistrySeeded();
const event = await registry.getEvent(eventId);
if (!event) throw new Error("11 Ekim etkinliği bulunamadı");
event.status = "live";
event.entry.isOpen = true;
for (const product of [event.products.matchlab, event.products.wordcloud]) {
  Object.assign(product, { enabled: true, visible: true, state: "live", dataMode: "live" });
}
Object.assign(event.products.five, { enabled: false, visible: false, state: "disabled" });
await registry.getEventRegistryStore().setJSON(`events/${eventId}.json`, event);
await flow.mutateEventFlow(eventId, "configure", {
  steps: [
    { product: "matchlab", durationMinutes: 90 },
    { product: "wordcloud", durationMinutes: 60 },
  ],
});
await flow.mutateEventFlow(eventId, "start");

const handlers = {
  context: (await sandbox.load("event-registry")).default,
  flow: (await sandbox.load("event-flow")).default,
  network: (await sandbox.load("event-network")).default,
  profile: (await sandbox.load("member-profile")).default,
  wordcloud: (await sandbox.load("event-wordcloud")).default,
  reviews: (await sandbox.load("event-reviews")).default,
};

async function createFixtureProfile(name, email) {
  const created = await members.createAdminMemberProfile({ name, email });
  if (!created.created) throw new Error(`Test profili oluşturulamadı: ${email}`);
  const session = await members.loginMemberProfile(email, created.credentials[0].temporaryPassword);
  await members.changeMemberPassword(session.token, password);
  return session.token;
}

const readySession = await createFixtureProfile("Hazır Katılımcı", "hazir@demo.example.org");
await createFixtureProfile("Kayıtlı Katılımcı", "kayitli@demo.example.org");
const register = async (firstName, lastName, email, cookie = "") => {
  const response = await handlers.network(
    new Request(`${origin}/api/event-products/network`, {
      method: "POST",
      headers: { "content-type": "application/json", origin, ...(cookie ? { cookie } : {}) },
      body: JSON.stringify({
        action: "register", event: slug, firstName, lastName, email,
        attendedEvent: slug, offers: ["tasarım"], offersDetail: "Birlikte üretim",
        needs: "Yeni bağlantılar", needTag: "networking", intro: "Yeni fikirler arıyorum",
        eventConsent: true, generalNetworkOptIn: false, aiAnalysisConsent: false,
      }),
    }),
    {},
  );
  if (!response.ok) throw new Error(`Test katılımcısı: ${await response.text()}`);
};
await register("Hazır", "Katılımcı", "hazir@demo.example.org", `notwork_profile_session=${readySession}`);
for (let index = 0; index < 9; index++) {
  await register("Örnek", `Katılımcı ${index + 1}`, `ornek-${index}@demo.example.org`);
}

function send(res, response) {
  res.statusCode = response.status;
  for (const [key, value] of response.headers) {
    if (!(["connection", "transfer-encoding", "content-length"].includes(key))) {
      res.setHeader(key, value);
    }
  }
  if (response.body) Readable.fromWeb(response.body).pipe(res);
  else res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", origin);
    if (url.pathname === "/__sandbox" && req.method === "POST") {
      const body = await new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => resolve(raw));
      });
      const action = new URLSearchParams(body).get("action");
      if (!["start", "advance", "reset"].includes(action)) throw new Error("Geçersiz işlem");
      await flow.mutateEventFlow(eventId, action);
      res.writeHead(303, { location: "/__sandbox" });
      res.end();
      return;
    }
    if (url.pathname === "/__sandbox") {
      const state = await flow.readEventFlow(eventId);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Notwork test</title><style>body{font:16px system-ui;background:#eaf6ff;color:#173e57;max-width:620px;margin:40px auto;padding:20px}a,button{display:inline-block;background:#267fb1;color:white;border:0;border-radius:14px;padding:12px 16px;margin:6px;text-decoration:none;font:inherit}</style><h1>11 Ekim · yerel test</h1><p>Yalnızca bu bilgisayardaki geçici test verisi kullanılır. Canlı kayıtlar ve timer değişmez.</p><p>Akış: <b>${state.status}</b> · aktif: <b>${state.steps[state.currentStepIndex]?.label || "yok"}</b></p><p><a href="/linkler?event=${slug}">Katılımcı girişine git →</a></p><p>Mevcut profil, etkinlik kaydı yok: <b>kayitli@demo.example.org</b><br>Etkinlik kaydı hazır: <b>hazir@demo.example.org</b><br>Şifre: <b>${password}</b></p><p>Yeni kayıt için bu iki adresten farklı bir <b>@demo.example.org</b> adresi kullan.</p><form method="post"><button name="action" value="start">Match'i başlat</button><button name="action" value="advance">Sonraki aşama</button><button name="action" value="reset">Akışı sıfırla</button></form>`);
      return;
    }
    let handler;
    if (url.pathname === "/api/events/context") handler = handlers.context;
    else if (url.pathname === "/api/events/flow") handler = handlers.flow;
    else if (url.pathname === "/api/member-profile") handler = handlers.profile;
    else if (["/api/event-products/network", "/api/events/21-agustos/network"].includes(url.pathname)) handler = handlers.network;
    else if (["/api/event-products/wordcloud", "/api/events/21-agustos/wordcloud"].includes(url.pathname)) handler = handlers.wordcloud;
    else if (url.pathname === "/api/event-reviews") handler = handlers.reviews;
    if (handler) {
      const body = ["GET", "HEAD"].includes(req.method || "GET")
        ? undefined
        : await new Promise((resolve) => {
            const chunks = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => resolve(Buffer.concat(chunks)));
          });
      const headers = new Headers(req.headers);
      headers.delete("host");
      headers.delete("connection");
      const response = await handler(
        new Request(url, { method: req.method, headers, ...(body ? { body } : {}) }),
        {},
      );
      send(res, response);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Bu API yerel testte tanımlı değil");
      return;
    }
    const response = await fetch(new URL(req.url || "/", upstream), {
      method: req.method,
      headers: { accept: req.headers.accept || "*/*" },
    });
    send(res, response);
  } catch (error) {
    console.error("Yerel test isteği", error);
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(error instanceof Error ? error.message : "Test isteği başarısız");
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log(`11 Ekim yerel kullanıcı testi: ${origin}/__sandbox`);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => sandbox.cleanup().finally(() => process.exit(0))));
}
