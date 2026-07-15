export type EventReview = {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  rating: number;
  comment: string;
  photoDataUrl?: string;
  consentAt: string;
  createdAt: string;
};

export type EventReviewInput = {
  eventId: string;
  eventTitle?: string;
  name: string;
  rating: number;
  comment: string;
  photoDataUrl?: string;
  privateNote?: string;
  consent: boolean;
};

const API_URL = "/api/event-reviews";

export async function listEventReviews(eventId?: string): Promise<EventReview[]> {
  const response = await fetch(eventId ? `${API_URL}?event=${encodeURIComponent(eventId)}` : API_URL, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Etkinlik değerlendirmeleri alınamadı");
  return (await response.json()) as EventReview[];
}

export async function addEventReview(input: EventReviewInput): Promise<EventReview> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as EventReview;
}

export function averageRating(reviews: EventReview[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
}
