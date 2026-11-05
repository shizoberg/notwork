import { redirect, createFileRoute } from "@tanstack/react-router";
import { type EventProductConfig } from "@/components/EventProductPage";
import { createNoIndexSeo } from "@/lib/seo";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
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
  beforeLoad: () => { throw redirect({ to: "/19-aralik", replace: true }); },
});
