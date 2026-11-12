import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { germanySeo } from "@/components/germany/GermanySite";
import { munichEvent } from "@/lib/munich-event";
import { eventConfig as sahne } from "./22-kasim";

const program = [
  [
    "Interaktiver Auftakt",
    "ntw.wordcloud",
    "Wir reichen das Mikrofon weiter.",
    "Deine Antworten erscheinen live auf dem Bildschirm.",
  ],
  [
    "Zwei Vorträge",
    "2 persönliche Geschichten",
    "Zwei Geschichten vom Scheitern.",
    "Zwei Menschen erzählen, was sie ausprobiert und daraus gelernt haben.",
  ],
  [
    "30 Minuten",
    "notwork match",
    "Die App bringt euch zusammen.",
    "Anhand deiner Interessen und Bedürfnisse findest du eine Dreiergruppe.",
  ],
  [
    "Zwei weitere Vorträge",
    "2 persönliche Geschichten",
    "Zwei weitere Geschichten vom Scheitern.",
    "Zwei weitere Menschen teilen ihre Wendepunkte.",
  ],
  [
    "60 Minuten",
    "Networking",
    "Zeit für neue Kontakte.",
    "Setze die Gespräche mit Menschen fort, die du an diesem Abend kennenlernst.",
  ],
];

const photos = [
  munichEvent.image,
  "/community/21.jpg",
  "/community/14.jpg",
  "/community/27.jpg",
  "/community/22.jpg",
];

const config: EventProductConfig = {
  ...sahne,
  german: true,
  comingSoon: true,
  trackingId: "notwork-buehne-2026-12-04",
  trackingName: "notwork Bühne München",
  eventLabel: "Bühne",
  imageTitle: "notwork Bühne",
  imageSubtitle: "4. Dezember · 20.00 Uhr · München",
  titleLines: ["notwork Bühne"],
  titleSubtitle: "Social Networking Event",
  date: "4. Dezember 2026",
  day: "Freitag",
  time: "20.00 Uhr",
  timeDetail: "Beginn",
  venue: munichEvent.city,
  venueUrl: undefined,
  city: "",
  description: "Geschichten vom Scheitern und Networking mit unserer Matching-App.",
  descriptionContent: (
    <>
      <strong>Geschichten vom Scheitern und Networking.</strong> Mit der{" "}
      <strong>Matching-App</strong> lernst du Menschen kennen, die zu deinen Interessen und Zielen
      passen.
    </>
  ),
  capacityLabel: "Begrenzte Plätze",
  gallery: photos.map((src, index) => ({
    src,
    alt: `Foto von einem früheren notwork Event · ${index + 1}`,
    label: "Eventfoto",
    position: sahne.gallery[index]?.position,
  })),
  tickets: sahne.tickets.map((ticket) =>
    ticket.id === "single"
      ? {
          ...ticket,
          name: "Einzelticket",
          note: "Höre persönliche Geschichten und lerne mit der Matching-App neue Menschen kennen.",
        }
      : {
          ...ticket,
          name: "Ticket für zwei",
          note: "Kommt zu zweit, je 550 TL pro Person.",
          badge: "100 TL Ersparnis",
        },
  ),
  ticketGift: "Zum Ticket für zwei gibt es einen Schlüsselanhänger oder ein Stickerpaket.",
  ticketUrl: undefined,
  flowEyebrow: "In 5 Schritten",
  flowTitleLines: ["notwork Programm"],
  flow: sahne.flow.map((step, index) => {
    const [duration, product, title, description] = program[index];
    return { ...step, duration, product, title, description };
  }),
  communityEyebrow: "Mehr als ein Abend",
  communityDescription: "Auch nach dem Event bleiben die Verbindungen bestehen.",
};

export const Route = createFileRoute("/de/4-dezember")({
  head: () =>
    germanySeo(munichEvent.path, "notwork Bühne · 4. Dezember in München", config.description),
  component: () => <EventProductPage config={config} />,
});
