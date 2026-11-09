import { createHash } from "node:crypto";
const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
// One letter + three digits. Candidates are atomically reserved per event.
export function participantDisplayCode(participantId: string, attempt = 0) {
  const d = createHash("sha256").update(`${participantId}:${attempt}`).digest();
  return letters[d[0] % letters.length] + String(d.readUInt32BE(1) % 1000).padStart(3, "0");
}
