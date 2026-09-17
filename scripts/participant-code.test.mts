import { test } from "node:test";
import assert from "node:assert/strict";
import { participantDisplayCode } from "../netlify/functions/_participant-code.mts";

test("simultaneous attendees start with distinct stable personal codes", async () => {
  const ids = Array.from({ length: 10000 }, (_, index) => `attendee-${index}`);
  const codes = await Promise.all(ids.map(async (id) => participantDisplayCode(id)));
  assert.equal(new Set(codes).size, ids.length);
  assert.ok(codes.every((code) => /^[A-F0-9]{10}$/.test(code)));
  assert.equal(participantDisplayCode(ids[0]), codes[0]);
  assert.notEqual(participantDisplayCode(ids[0], 1), codes[0]);
});
