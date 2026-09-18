import { createHash } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Four readable characters give 1,048,576 combinations. The store still
// reserves the result atomically, so a rare collision advances to the next one.
export function participantDisplayCode(participantId: string, attempt = 0) {
  const digest = createHash("sha256").update(`${participantId}:${attempt}`).digest();
  let code = "";
  for (let index = 0; index < 4; index += 1) code += alphabet[digest[index] % alphabet.length];
  return code;
}
