import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { createEventStructuredData } from "@/lib/structured-data";
import { eventConfig as previousFast } from "./17-eylul";

export const eventConfig: EventProductConfig = {
  ...previousFast,
  titleSubtitle: "social networking event",
  tickets: previousFast.tickets.map((ticket) => ticket.id === "single" ? { ...ticket, note: "Match ile tanış, Five’da çözüm üret, DJ eşliğinde bağlantılarını güçlendir." } : ticket),
  trackingId: "notwork-fast-2026-12-10",
  eventLabel: "fast",
  imageSubtitle: "10 aralık · 20.00 · köşk alsancak",
  titleLines: ["notwork fast"],
  description: "Mobil uygulama destekli networking eşleştirme sistemi. Match, Five ve DJ ile yeni bağlantılar.",
  descriptionContent: <><strong className="font-semibold text-foreground">Hızlı networking, güçlü bağlantılar.</strong> Mobil uygulamamızdaki <strong className="font-semibold text-foreground">eşleştirme sistemi</strong> ile tanış, Five’da birlikte çözüm üret ve DJ eşliğinde sohbeti sürdür.</>,
  ticketGift: "İki kişilik bilet alanlara anahtarlık veya sticker paketi hediye.",
  flowTitleLines: ["notwork akış"],
  date: "10 Aralık 2026",
  day: "Perşembe",
  ticketUrl: "https://www.biletimgo.com/etkinlik/notwork-fast-hizli-networking-eventi-32802",
  gallery: previousFast.gallery.map((item, index) => index === 1 ? {
    src: "/events/17-eylul/notwork-fast-akis.jpg",
    alt: "notwork Fast etkinlik akışı: Match ile tanış, Five ile çözüm üret, DJ ve networking ile bağlantılarını derinleştir",
    label: "akış",
    hideCaption: true,
    position: "center",
  } : ({
    ...item,
    alt: item.alt.replaceAll("17 Eylül", "10 Aralık"),
    subtitle: item.subtitle?.replaceAll("17 eylül", "10 aralık"),
  })),
  flow: previousFast.flow.map((step) => ({
    ...step,
    product: step.product === "ntw.match.lab" ? "notwork match" : step.product,
  })),
};

export const Route = createFileRoute("/10-aralik")({
  head: () =>
    createSeo({
      title: "10 Aralık notwork Fast | Hızlı Networking Etkinliği",
      description:
        "10 Aralık 2026 saat 20.00’da Köşk Alsancak’ta notwork match, Five, DJ ve serbest networking. Yeni insanlarla tanış, biletini al.",
      path: "/10-aralik",
      type: "article",
      structuredData: createEventStructuredData({
        name: "notwork Fast",
        description: "notwork match, Five ve DJ eşliğinde hızlı networking etkinliği.",
        path: "/10-aralik",
        startDate: "2026-12-10T20:00:00+03:00",
        endDate: "2026-12-10T23:30:00+03:00",
        venueName: "Köşk Alsancak",
        addressLocality: "Konak",
        images: ["/community/17.jpg", "/community/23.jpg"],
        ticketUrl: eventConfig.ticketUrl!,
        lowPrice: 450,
        highPrice: 800,
      }),
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
