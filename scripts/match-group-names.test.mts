import assert from "node:assert/strict";
import test from "node:test";
import { matchGroupName } from "../netlify/functions/_match-group-name.mts";

test("busy event groups have distinct, legible one-word names", () => {
  const used: string[] = [];
  for (let index = 0; index < 100; index++) {
    const id = `match-event-${index}`;
    const name = matchGroupName(id, used);
    assert.match(name, /^\p{L}+[0-9]*$/u);
    assert.ok(!used.includes(name));
    used.push(name);
  }
  assert.equal(new Set(used).size, 100);
  assert.equal(matchGroupName("match-event-0"), matchGroupName("match-event-0"));
});
