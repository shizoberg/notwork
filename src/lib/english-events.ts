import type { EventProductConfig } from "@/components/EventProductPage";
import { munichEvent } from "@/lib/munich-event";
import { eventConfig } from "../routes/22-kasim";

const programme = [
  ["Opening", "WordCloud", "Join the live word cloud", "Share a short answer and see responses take shape on the screen."],
  ["Talks", "Stories", "Hear the first two stories", "Speakers share setbacks and what they learned."],
  ["Networking", "notwork Match", "Meet your group", "Match brings people together based on interests and what they can contribute."],
  ["Talks", "Stories", "Hear two more stories", "Two more speakers share a turning point in their work or life."],
  ["Networking", "Open networking", "Keep the conversation going", "Meet more people and follow up with your group."],
];

export function englishEvent(munich = false): EventProductConfig {
  const date = munich ? "4 December 2026" : "22 November 2026";
  const venue = munich ? "Munich" : eventConfig.venue;
  return {
    ...eventConfig, english: true, comingSoon: munich, date, venue,
    trackingId: munich ? "notwork-buehne-2026-12-04" : eventConfig.trackingId,
    trackingName: munich ? "notwork Bühne München" : eventConfig.trackingName,
    city: munich ? "" : eventConfig.city,
    venueUrl: munich ? undefined : eventConfig.venueUrl,
    ticketUrl: munich ? undefined : eventConfig.ticketUrl,
    eventLabel: "Stage", imageTitle: "notwork Stage", titleLines: ["notwork Stage"],
    imageSubtitle: `${date} · 20:00 · ${venue}`,
    day: munich ? "Friday" : "Sunday", time: "20:00", timeDetail: "Doors open",
    description: "Stories of failure and networking with notwork Match.",
    descriptionContent: undefined,
    capacityLabel: "Limited capacity",
    gallery: (munich ? [munichEvent.image, "/community/21.jpg", "/community/14.jpg", "/community/27.jpg", "/community/22.jpg"].map((src) => ({ src })) : eventConfig.gallery).map((item) => ({ ...item, alt: "Photo from a past notwork event", label: "Event photo", subtitle: undefined })),
    tickets: eventConfig.tickets.map((ticket) => ({ ...ticket, name: ticket.id === "single" ? "Single ticket" : "Ticket for two", note: ticket.id === "single" ? "Listen to personal stories and meet people through Match." : "Come together for 550 TL each.", badge: ticket.id === "single" ? undefined : "Save 100 TL" })),
    ticketGift: "Tickets for two include a keyring or a sticker pack.",
    flowEyebrow: "Five steps", flowTitleLines: ["Event programme"], flowDescription: "",
    flow: eventConfig.flow.map((step, index) => {
      const [duration, product, title, description] = programme[index];
      return { ...step, duration, product, title, description, highlights: undefined };
    }),
    communityEyebrow: "Beyond the event",
    communityDescription: "Stay in touch with the people you meet.",
  };
}
