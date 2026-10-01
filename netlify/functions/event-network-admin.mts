import { createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { Config, Context } from "@netlify/functions";
import {
  getEventNetworkDatasetInfo,
  getEventNetworkStore,
  getNextMatchGroup,
  listActiveMatchGroups,
  listRegistrations,
  repairParticipantCodes,
  resetDemoEventNetworkDataset,
  seedSampleRegistrations,
  type NetworkAdminInput,
} from "./_event-network-store.mjs";
import {
  eventIdentifierFromRequest,
  runWithEventRequestContext,
} from "./_event-product-context.mjs";

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as NetworkAdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    const eventIdentifier = eventIdentifierFromRequest(request, input);
    return runWithEventRequestContext(
      eventIdentifier,
      "matchlab",
      async () => {
        const store = getEventNetworkStore();
        if (input.action === "repairCodes") {
          if (!eventIdentifier) return new Response("Etkinlik gerekli", { status: 400 });
          return Response.json(await repairParticipantCodes(store), {
            headers: { "cache-control": "no-store, private" },
          });
        }
        if (input.action === "resetDemo") {
          if (getEventNetworkDatasetInfo().mode !== "demo")
            return new Response("Yalnızca demo verisi sıfırlanabilir", { status: 400 });
          await resetDemoEventNetworkDataset(store);
        }
        if (input.action === "seedSamples") {
          if (getEventNetworkDatasetInfo().mode !== "demo")
            return new Response("Sanal veri yalnızca demo alanına yazılabilir", { status: 400 });
          const samples = JSON.parse(
            await readFile(
              new URL("../data/21-agustos-network-sample.json", import.meta.url),
              "utf8",
            ),
          );
          await resetDemoEventNetworkDataset(store);
          const seeded = await seedSampleRegistrations(store, samples);
          for (const registration of seeded) {
            if (registration.accessToken) await getNextMatchGroup(store, registration.accessToken);
          }
        }
        const registrations = await listRegistrations(store);
        return Response.json(
          {
            registrations,
            groups: await listActiveMatchGroups(store, registrations),
            database: getEventNetworkDatasetInfo(),
          },
          { headers: { "cache-control": "no-store, private" } },
        );
      },
      { allowDisabled: true, allowHidden: true, modeOverride: input.mode },
    );
  } catch {
    return new Response("Kayıtlar alınamadı", { status: 500 });
  }
};

export const config: Config = {
  path: ["/api/admin/events/21-agustos/network", "/api/admin/event-products/network"],
};
