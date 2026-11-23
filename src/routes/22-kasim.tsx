import { PastEventPage } from "@/components/PastEventPage";
import { novemberEventPhotos } from "@/lib/november-event-photos";
import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { createEventStructuredData } from "@/lib/structured-data";
import { eventConfig as previousSahne } from "./9-ekim";

export const eventConfig: EventProductConfig = {
  ...previousSahne,
  titleSubtitle: "social networking event",
  tickets: previousSahne.tickets.map((ticket) => ticket.id === "single" ? { ...ticket, note: "Gerçek hikâyeleri dinle, mobil eşleştirme ile yeni insanlarla tanış." } : ticket),
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
 head:()=>createSeo({title:"22 Kasım notwork Sahne · Geçmiş etkinlik",description:"22 Kasım 2026 Rene Lokal buluşmasından grup fotoğrafları, başarısızlık hikâyeleri ve networking anları.",path:"/22-kasim",type:"article"}),
 component:()=> <PastEventPage title="notwork sahne" date="22 Kasım 2026" venue="Rene Lokal · İzmir" photos={novemberEventPhotos} />,
});
