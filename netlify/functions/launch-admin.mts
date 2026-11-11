import { createHash, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { changeLaunchDataset, getLaunchBulletin, getLaunchDatasets } from "./_launch-datasets.mjs";
import { getEvent } from "./_event-registry-store.mjs";
import {
  defaultLaunchFlow,
  launchAssetPattern,
  launchImageLimit,
  validateLaunchFlow,
} from "../../src/lib/launch-flow.ts";
import { atomicState, readAtomicState } from "./_atomic-state.mjs";
import {
  launchCredentials,
  launchSession,
  launchCookie,
  hasLaunchSession,
  launchAdminSlug,
} from "./_launch-admin-auth.mjs";
const assetTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function imageExtension(bytes: Uint8Array) {
  const signature = Buffer.from(bytes.subarray(0, 12));
  if (signature.subarray(0, 3).toString("hex") === "ffd8ff") return "jpg";
  if (signature.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "png";
  if (signature.toString("ascii", 0, 4) === "RIFF" && signature.toString("ascii", 8, 12) === "WEBP")
    return "webp";
  return null;
}

export default async (request: Request, context: Context) => {
  if (request.method !== "POST" && request.method !== "GET")
    return new Response("Method not allowed", { status: 405 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new Response("Geçersiz kaynak", { status: 403 });
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const headers = { "cache-control": "no-store, private" };
  try {
    const params = new URL(request.url).searchParams;
    if (params.has("asset")) {
      const store = getStore({ name: "launchspace-brand", consistency: "strong" });
      if (request.method === "POST") {
        if (!(await hasLaunchSession(request, launchAdminSlug)))
          return new Response("Yönetici oturumu gerekli", { status: 401, headers });
        if (Number(request.headers.get("content-length")) > launchImageLimit)
          return new Response("Görsel en fazla 2 MB olabilir", { status: 413, headers });
        const bytes = await request.arrayBuffer();
        if (bytes.byteLength > launchImageLimit)
          return new Response("Görsel en fazla 2 MB olabilir", { status: 413, headers });
        const extension = imageExtension(new Uint8Array(bytes));
        if (!extension) return new Response("JPG, PNG veya WebP yükle", { status: 400, headers });
        const key = `${randomUUID()}.${extension}`;
        await store.set(key, Buffer.from(bytes).toString("base64"));
        return Response.json({ url: `/api/launch-admin?asset=${key}` }, { headers });
      }
      const key = params.get("asset") || "";
      if (!launchAssetPattern.test(key)) return new Response(null, { status: 404 });
      const bytes = await store.get(key, { type: "text" });
      if (!bytes) return new Response(null, { status: 404 });
      return new Response(new Uint8Array(Buffer.from(bytes, "base64")), {
        headers: {
          "content-type": assetTypes[key.split(".").pop()!],
          "cache-control": "public, max-age=31536000, immutable",
          "x-content-type-options": "nosniff",
        },
      });
    }
    if (request.method === "GET") {
      const event = await getEvent(launchAdminSlug);
      if (!event) return new Response("Etkinlik hazırlanıyor", { status: 503 });
      if (params.get("dataset") === "active") {
        const { active } = await getLaunchDatasets(event);
        const bulletin = await getLaunchBulletin(event, active);
        return Response.json({ ...active, bulletin }, { headers });
      }
      const store = getStore({ name: "event-network", consistency: "strong" });
      return Response.json(
        {
          ...defaultLaunchFlow,
          ...(await readAtomicState(
            store,
            `events/${event.id}/launch-flow.json`,
            () => defaultLaunchFlow,
          )),
        },
        { headers },
      );
    }
    const raw = await request.text();
    if (raw.length > 24000) return new Response("İstek çok büyük", { status: 413 });
    const input = JSON.parse(raw);
    if (input.action !== "saveFlow" && raw.length > 2000)
      return new Response("İstek çok büyük", { status: 413 });
    if (["listDatasets", "createDataset", "activateDataset"].includes(input.action)) {
      if (!(await hasLaunchSession(request, launchAdminSlug)))
        return new Response("Yönetici oturumu gerekli", { status: 401, headers });
      const event = await getEvent(launchAdminSlug);
      if (!event) return new Response("Etkinlik bulunamadı", { status: 404, headers });
      try {
        return Response.json(
          input.action === "listDatasets"
            ? await getLaunchDatasets(event)
            : await changeLaunchDataset(event, input),
          { headers },
        );
      } catch (error) {
        return new Response(
          error instanceof Error ? error.message : "Veri seti işlemi tamamlanamadı",
          { status: 400, headers },
        );
      }
    }
    if (input.action === "saveFlow") {
      if (!(await hasLaunchSession(request, launchAdminSlug)))
        return new Response("Yönetici oturumu gerekli", { status: 401, headers });
      const event = await getEvent(launchAdminSlug);
      if (!event) return new Response("Etkinlik bulunamadı", { status: 404, headers });
      let flow;
      try {
        flow = validateLaunchFlow(input.flow);
      } catch (error) {
        return new Response(error instanceof Error ? error.message : "Akış geçersiz", {
          status: 400,
          headers,
        });
      }
      const store = getStore({ name: "event-network", consistency: "strong" });
      const saved = await atomicState(
        store,
        `events/${event.id}/launch-flow.json`,
        () => structuredClone(defaultLaunchFlow),
        (current) => {
          if (current.revision !== flow.revision) return null;
          Object.assign(current, flow, { revision: flow.revision + 1 });
          return current;
        },
      );
      if (!saved)
        return new Response("Akış başka bir oturumda değişti. Yenileyip tekrar dene.", {
          status: 409,
          headers,
        });
      return Response.json(saved, { headers });
    }
    if (input.action === "logout")
      return Response.json(
        { ok: true },
        {
          headers: {
            ...headers,
            "set-cookie": `${launchCookie}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
          },
        },
      );
    if (input.action === "me")
      return Response.json(
        { authenticated: await hasLaunchSession(request, launchAdminSlug), event: launchAdminSlug },
        { headers },
      );
    if (input.action !== "login") return new Response("Geçersiz işlem", { status: 400 });
    const event = await getEvent(launchAdminSlug);
    if (!event) return new Response("Etkinlik hazırlanıyor", { status: 503 });
    const ip = context.ip || "unknown";
    const key = `events/${event.id}/demo/matchlab/launch-auth/${createHash("sha256").update(ip).digest("hex")}.json`;
    const permitted = await atomicState(
      getStore({ name: "event-network", consistency: "strong" }),
      key,
      () => ({ count: 0, until: 0 }),
      (state) => {
        if (Date.now() > state.until) {
          state.count = 0;
          state.until = Date.now() + 15 * 60_000;
        }
        if (state.count >= 10) return false;
        state.count++;
        return true;
      },
    );
    if (!permitted)
      return new Response("Çok fazla deneme. 15 dakika sonra tekrar dene.", { status: 429 });
    if (!launchCredentials(input.username, input.password))
      return new Response("Kullanıcı adı veya şifre hatalı", { status: 401 });
    await atomicState(
      getStore({ name: "event-network", consistency: "strong" }),
      key,
      () => ({ count: 0, until: 0 }),
      (state) => {
        state.count = 0;
      },
    );
    return Response.json(
      { authenticated: true, event: launchAdminSlug },
      {
        headers: {
          ...headers,
          "set-cookie": `${launchCookie}=${launchSession(event.id)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`,
        },
      },
    );
  } catch {
    return new Response("Yönetici girişi tamamlanamadı", { status: 400 });
  }
};
export const config: Config = { path: "/api/launch-admin" };
