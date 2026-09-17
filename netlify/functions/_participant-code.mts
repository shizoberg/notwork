import { createHash } from "node:crypto";

// Participant-specific allocation prevents concurrent requests all choosing A01.
export function participantDisplayCode(participantId: string, attempt = 0) {
  return createHash("sha256").update(`${participantId}:${attempt}`).digest("hex").slice(0, 10).toUpperCase();
}
