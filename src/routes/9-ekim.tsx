import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Mic2, MessageCircleQuestion, Sparkles, UsersRound } from "lucide-react";

import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";

const eventConfig: EventProductConfig = {
  eventLabel: "classic edition",
  imageTitle: "notwork classic",
  imageSubtitle: "9 ekim · 19.30 · rene lokal",
  titleLines: ["notwork", "classic"],
  description:
    "Dört ilham veren başarısızlık hikâyesi, canlı ntw.wordcloud ve iki networking arasında ntw.match.lab ile tasarlanmış klasik notwork deneyimi.",
  date: "9 Ekim 2026",
  day: "Cuma",
  time: "19.30",
  timeDetail: "Etkinlik başlangıcı",
  venue: "Rene Lokal",
  venueUrl: "https://share.google/X6ssk8zMnf49YzrkD",
  city: "Bornova · İzmir",
  experienceLabel: "Networking + ilham veren hikâyeler",
  experienceDetail: "Sahne, WordCloud ve doğru eşleşmeler",
  gallery: [
    {
      src: "/community/8.jpg",
      alt: "notwork Classic etkinliğinde sahne ve konuşmacı",
      label: "classic",
      position: "center 38%",
    },
    {
      src: "/community/21.jpg",
      alt: "notwork etkinliğinde konuşmacıyı dinleyen katılımcılar",
      label: "stories",
      position: "center 44%",
    },
    {
      src: "/community/14.jpg",
      alt: "notwork etkinliğinde networking yapan katılımcılar",
      label: "match",
      position: "center 48%",
    },
    {
      src: "/community/27.jpg",
      alt: "notwork Classic gecesinin community atmosferi",
      label: "community",
      position: "center 46%",
    },
  ],
  tickets: [
    {
      id: "single",
      name: "Tek kişilik",
      note: "Sahne + interaktif deneyim + networking",
      price: 600,
    },
    {
      id: "duo",
      name: "İki kişilik",
      note: "Birlikte gel, kişi başı 500 TL",
      price: 1000,
      badge: "200 TL avantaj",
    },
  ],
  ticketGift: "Her bilete ntw sticker paketi + ntw anahtarlık hediye.",
  ticketUrl: "",
  flowEyebrow: "notwork classic akışı",
  flowTitleLines: ["Sor. Dinle.", "Eşleş ve yeniden bağ kur."],
  flowDescription:
    "Sahne ve networking birbirinden kopuk değil. WordCloud ortak merakı görünür kılar; MatchLab iki arada doğru kişileri bulur.",
  flow: [
    {
      time: "19.30",
      duration: "interaktif açılış",
      product: "ntw.wordcloud",
      title: "Odadaki ortak düşünceyi canlı gör.",
      description:
        "Telefonundan kısa yanıtını gönder. Benzer cevaplar büyür ve odanın merakı sahnedeki canlı kelime bulutuna dönüşür.",
      highlights: ["canlı cevaplar", "ortak kelimeler büyür"],
      icon: Cloud,
      accent: "bg-[#b8eff0] text-[#07353a]",
    },
    {
      time: "20.00",
      duration: "ilk iki sunum",
      product: "2 ilham veren hikâye",
      title: "Başarısızlığın içinden çıkan gerçek dersler.",
      description:
        "İki konuşmacı; denediği, olduramadığı ve sonrasında yolunu nasıl yeniden kurduğunu filtresiz biçimde anlatır.",
      highlights: ["2 konuşmacı", "gerçek deneyim"],
      icon: Mic2,
      accent: "bg-[#ffd1e5] text-[#63233f]",
    },
    {
      time: "20.45",
      duration: "30 dakika",
      product: "ntw.match.lab",
      title: "İlk networking arasında doğru grubu bul.",
      description:
        "Niyet, ihtiyaç ve katkı alanlarına göre üç kişilik gruplara ayrılır; neden tanıştığını bilerek sohbete başlarsın.",
      highlights: ["3 kişilik grup", "amaç odaklı eşleşme"],
      icon: UsersRound,
      accent: "bg-[#d8c6ff] text-[#392263]",
    },
    {
      time: "21.15",
      duration: "iki yeni sunum",
      product: "2 ilham veren hikâye",
      title: "İki farklı yol, iki yeni kırılma noktası.",
      description:
        "Gecenin ikinci sahne bölümünde iki konuşmacı daha başarısızlıktan öğrendiği en önemli dersleri paylaşır.",
      highlights: ["2 konuşmacı", "yeni bakış açısı"],
      icon: MessageCircleQuestion,
      accent: "bg-[#ffe5a8] text-[#61450a]",
    },
    {
      time: "22.00",
      duration: "60 dakika",
      product: "networking free time",
      title: "Hikâyeleri bağlantıya dönüştür.",
      description:
        "MatchLab eşleşmelerini sürdür, konuşmacılarla tanış ve gecenin kalanında serbest biçimde yeni bağlantılar kur.",
      highlights: ["MatchLab devam", "serbest networking"],
      icon: Sparkles,
      accent: "bg-[#c9f1d7] text-[#174d2d]",
    },
  ],
  flowLayoutClass: "lg:grid-cols-3 xl:grid-cols-5",
  communityEyebrow: "classic geceden fazlası",
  communityDescription:
    "Aynı hikâyeleri dinleyen insanlar etkinlikten sonra network ağı ve community buluşmaları içinde birbirini yeniden bulur.",
  communityGallery: [
    "/community/27.jpg",
    "/community/22.jpg",
    "/community/19.jpg",
    "/community/16.jpg",
    "/community/24.jpg",
    "/community/25.jpg",
  ],
};

export const Route = createFileRoute("/9-ekim")({
  head: () =>
    createSeo({
      title: "9 Ekim notwork Classic | İzmir Networking Etkinliği",
      description:
        "9 Ekim’de Rene Lokal’de dört başarısızlık hikâyesi, canlı WordCloud, ntw.match.lab ve networking deneyimini bir araya getiren notwork Classic’e katıl.",
      path: "/9-ekim",
      keywords: [
        "9 Ekim İzmir etkinlik",
        "notwork Classic",
        "Rene Lokal etkinlik",
        "İzmir networking etkinliği",
        "başarısızlık hikayeleri",
      ],
      type: "article",
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
