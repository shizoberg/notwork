import assert from "node:assert/strict";
import { functionSandbox } from "./helpers/function-sandbox.mjs";

const sandbox = await functionSandbox();
const originalFetch = globalThis.fetch;
const originalKey = process.env.OPENAI_API_KEY;
const originalEnabled = process.env.NTW_AI_ENABLED;
process.env.OPENAI_API_KEY = "local-test-placeholder";
process.env.NTW_AI_ENABLED = "true";
const profile = {
  participant: { id: "test-person" },
  offers: ["tasarım"],
  offersDetail: "Prototip",
  needs: "Yazılım desteği",
  needTag: "yazılım",
};
try {
  const ai = await sandbox.load("_ntw-ai");
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    calls++;
    const request = JSON.parse(options.body);
    assert.equal(request.model, "gpt-5.6-luna");
    if (request.text.format.name.endsWith("analysis")) {
      assert.deepEqual(request.text.format.schema.properties.analysis, { type: "string" });
    }
    const result =
      request.text.format.name === "ntw_match_ranking"
        ? { participantIds: ["a", "b"] }
        : { analysis: "Tasarım ve yazılım deneyimleri ortak bir prototipe dönüşebilir." };
    return Response.json({
      output: [{ content: [{ type: "output_text", text: JSON.stringify(result) }] }],
    });
  };
  assert.ok(await ai.generateMatchAnalysis("match-test", [profile]));
  assert.ok(
    await ai.generateFiveAnalysis("five-test", { title: "Yeni ürünümü nasıl test edebilirim?" }, [
      { id: "a", offers: ["tasarım"] },
    ]),
  );
  assert.deepEqual(
    await ai.rerankMatchCandidates(
      "rank-test",
      profile,
      ["a", "b"].map((id) => ({ ...profile, participant: { id } })),
      2,
    ),
    ["a", "b"],
  );
  const probe = await ai.probeNtwAi();
  assert.equal(probe.ok, true);
  assert.equal(probe.reason, "ok");
  const aiStore = sandbox.blobs.getStore({ name: "ntw-ai" });
  assert.equal(
    (await aiStore.list({ prefix: "events/" })).blobs.length,
    4,
    "Successful prompts are archived",
  );
  globalThis.fetch = async () => Response.json({ output: [] });
  assert.equal(await ai.generateMatchAnalysis("invalid-response", [profile]), null);
  globalThis.fetch = async () => new Response("quota", { status: 429 });
  assert.equal(await ai.generateMatchAnalysis("quota-test", [profile]), null);
  globalThis.fetch = async () => {
    throw new Error("simulated network failure");
  };
  assert.equal(await ai.generateMatchAnalysis("network-error", [profile]), null);
  globalThis.fetch = async () => {
    throw new Error("BUDGET EXHAUSTED: fetch must never run");
  };
  await aiStore.setJSON("usage/budget-test.json", { calls: 400 });
  assert.equal(await ai.generateMatchAnalysis("budget-test", [profile]), null);
  process.env.NTW_AI_ENABLED = "false";
  assert.equal(await ai.generateMatchAnalysis("disabled", [profile]), null);
  assert.equal(calls, 4);
  console.log(
    "PASS AI: real Response.json decoding, Match/Five text, reranking, archival, invalid reply, 429, network failure, budget cap and disabled fallback. Paid calls: 0.",
  );
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
  if (originalEnabled === undefined) delete process.env.NTW_AI_ENABLED;
  else process.env.NTW_AI_ENABLED = originalEnabled;
  await sandbox.cleanup();
}
