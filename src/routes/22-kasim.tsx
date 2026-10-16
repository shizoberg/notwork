import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { createEventStructuredData } from "@/lib/structured-data";
import { eventConfig as previousSahne } from "./9-ekim";

export const eventConfig: EventProductConfig = {
  ...previousSahne,
  trackingId: "notwork-sahne-2026-11-22",
  imageSubtitle: "22 kasım · 20.00 · rene lokal",
  date: "22 Kasım 2026",
  day: "Pazar",
  time: "20.00",
  ticketGift: "İki kişilik bilet alanlara anahtarlık veya sticker paketi hediye.",
  description: "Başarısızlık hikâyeleri ve mobil uygulama destekli networking eşleştirme sistemi.",
  descriptionContent: <><strong className="font-semibold text-foreground">Başarısızlık hikâyeleri ve networking.</strong> Mobil uygulamamızdaki <strong className="font-semibold text-foreground">eşleştirme sistemi</strong> ile ilgi alanlarına ve beklentilerine uygun kişilerle tanış.</>,
  flowTitleLines: ["notwork akış"],
  ticketUrl:
    "https://www.biletimgo.com/etkinlik/notwork-sahne-basarisizlik-hikyeleri-network-etkinligi-32801",
  gallery: previousSahne.gallery.map((item) => ({
    ...item,
    hideSubtitle: item.hideCaption ? item.hideSubtitle : false,
    alt: item.alt.replaceAll("11 Ekim", "22 Kasım"),
    subtitle: item.subtitle?.replaceAll("11 ekim", "22 kasım"),
  })),
};

export const Route = createFileRoute("/22-kasim")({
  head: () =>
    createSeo({
      title: "22 Kasım notwork Sahne | Başarısızlık Hikâyeleri ve Networking",
      description:
        "22 Kasım 2026 saat 20.00’da Rene Lokal’de dört gerçek hikâye, interaktif WordCloud, notwork match ve networking. Biletini al.",
      path: "/22-kasim",
      type: "article",
      structuredData: createEventStructuredData({
        name: "notwork Sahne",
        description:
          "Başarısızlık hikâyeleri, interaktif WordCloud ve notwork match ile networking.",
        path: "/22-kasim",
        startDate: "2026-11-22T20:00:00+03:00",
        endDate: "2026-11-22T23:30:00+03:00",
        venueName: "Rene Lokal",
        addressLocality: "Bornova",
        images: ["/community/8.jpg", "/community/27.jpg"],
        ticketUrl: eventConfig.ticketUrl!,
        lowPrice: 600,
        highPrice: 1100,
      }),
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
