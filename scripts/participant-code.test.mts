import { test } from "node:test";
import assert from "node:assert/strict";
import { participantDisplayCode } from "../netlify/functions/_participant-code.mts";

test("short personal code candidates are readable and collision retries stay unique", async () => {
  const ids = Array.from({ length: 1000 }, (_, index) => `attendee-${index}`);
  const used = new Set<string>();
  const codes = ids.map((id) => {
    for (let attempt = 0; attempt < 64; attempt += 1) {
      const candidate = participantDisplayCode(id, attempt);
      if (used.has(candidate)) continue;
      used.add(candidate);
      return candidate;
    }
    throw new Error("code space exhausted");
  });
  assert.equal(new Set(codes).size, ids.length);
  assert.ok(codes.every((code) => /^[A-HJ-NP-Z2-9]{4}$/.test(code)));
  assert.equal(participantDisplayCode(ids[0]), codes[0]);
  assert.notEqual(participantDisplayCode(ids[0], 1), codes[0]);
});
