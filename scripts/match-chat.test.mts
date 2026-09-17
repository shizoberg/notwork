import { test } from "node:test";
import assert from "node:assert/strict";
import { matchChatKey } from "../netlify/functions/_match-chat.mts";

test("rooms are isolated, members share a room, stale and foreign groups are rejected", () => {
  const a = { id: "group-a", participantIds: ["1", "2", "3"] };
  const b = { id: "group-b", participantIds: ["4", "5", "6"] };
  assert.equal(matchChatKey("event", "1", a), matchChatKey("event", "2", a));
  assert.notEqual(matchChatKey("event", "1", a), matchChatKey("event", "4", b));
  assert.notEqual(matchChatKey("event", "1", a), matchChatKey("other-event", "1", a));
  assert.throws(() => matchChatKey("event", "1", b));
  assert.throws(() => matchChatKey("event", "1", null));
  assert.throws(() => matchChatKey("event", "1", a, "previous-group"));
});
