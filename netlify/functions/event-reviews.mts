import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

type ReviewInput = {
  eventId?: string;
  eventTitle?: string;
  name?: string;
  rating?: number;
  comment?: string;
  photoDataUrl?: string;
  privateNote?: string;
  consent?: boolean;
};

type ReviewRow = {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  rating: number;
  comment: string;
  photoDataUrl: string;
  privateNote: string;
  consentAt: string;
  createdAt: string;
};

const allowedEvents: Record<string, string> = {
  "14-temmuz-2026": "14 Temmuz notwork İzmir",
  "22-mayis": "22 Mayıs notwork · İstinyeArt İzmir",
  "10-nisan": "10 Nisan notwork · İstinyeArt İzmir",
  "8-mart": "8 Mart notwork · İstinyeArt İzmir",
  "10-subat": "10 Şubat notwork · İstinyeArt İzmir",
  "16-ocak": "16 Ocak notwork · İstinyeArt İzmir",
  "8-aralik": "8 Aralık notwork · İstinyeArt İzmir",
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function publicReview(review: ReviewRow) {
  const { privateNote: _privateNote, ...publicFields } = review;
  return publicFields;
}

async function listReviews(store: ReturnType<typeof getStore>, eventId: string) {
  const prefix = eventId ? `reviews/${eventId}/` : "reviews/";
  const { blobs } = await store.list({ prefix });
  const rows = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );
  return (rows.filter(Boolean) as ReviewRow[])
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map(publicReview);
}

export default async (request: Request, _context: Context) => {
  const store = getStore({ name: "event-reviews", consistency: "strong" });

  if (request.method === "GET") {
    const url = new URL(request.url);
    const eventId = clean(url.searchParams.get("event"), 60);
    if (eventId && !allowedEvents[eventId]) return new Response("Invalid event", { status: 400 });
    return Response.json(await listReviews(store, eventId), {
      headers: { "cache-control": "no-store" },
    });
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 1_400_000) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as ReviewInput;
    const eventId = clean(input.eventId, 60);
    const rating = Math.round(Number(input.rating));
    const comment = clean(input.comment, 700);
    const photoDataUrl = clean(input.photoDataUrl, 1_100_000);

    if (!allowedEvents[eventId]) return new Response("Etkinlik seçimi gerekli", { status: 400 });
    if (!input.consent) return new Response("KVKK onayı gerekli", { status: 400 });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return new Response("Puan 1-5 arasında olmalı", { status: 400 });
    }
    if (!comment) return new Response("Yorum gerekli", { status: 400 });
    if (photoDataUrl && !photoDataUrl.startsWith("data:image/")) {
      return new Response("Geçersiz fotoğraf", { status: 400 });
    }

    const now = new Date().toISOString();
    const review: ReviewRow = {
      id: crypto.randomUUID(),
      eventId,
      eventTitle: allowedEvents[eventId],
      name: clean(input.name, 70) || "notwork katılımcısı",
      rating,
      comment,
      photoDataUrl,
      privateNote: clean(input.privateNote, 1000),
      consentAt: now,
      createdAt: now,
    };

    await store.setJSON(`reviews/${eventId}/${Date.now()}-${review.id}.json`, review);
    return Response.json(publicReview(review), {
      status: 201,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
};

export const config: Config = { path: "/api/event-reviews" };
