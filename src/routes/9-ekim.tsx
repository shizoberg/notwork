import { createFileRoute, redirect } from "@tanstack/react-router";
import { Cloud, Mic2, MessageCircleQuestion, Sparkles, UsersRound } from "lucide-react";

import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { createEventStructuredData } from "@/lib/structured-data";

export const eventConfig: EventProductConfig = {
  trackingId: "notwork-sahne-2026-10-11",
  trackingName: "notwork Sahne",
  eventLabel: "sahne",
  imageTitle: "notwork sahne",
  imageSubtitle: "11 ekim · 19.30 · rene lokal",
  titleLines: ["notwork", "sahne"],
  description:
    "Dört ilham veren başarısızlık hikâyesi, canlı ntw.wordcloud ve iki networking arasında ntw.match.lab ile tasarlanmış klasik notwork deneyimi.",
  date: "11 Ekim 2026",
  day: "Pazar",
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
      alt: "notwork Sahne etkinliğinde sahne ve konuşmacı",
      label: "sahne",
      position: "center 38%",
    },
    {
      src: "/events/9-ekim/notwork-sahne-etkinlik-akisi.jpg",
      alt: "notwork Sahne WordCloud, başarısızlık hikâyeleri, eşleşme ve networking akışı",
      label: "akış",
      position: "center",
    },
    {
      src: "/community/14.jpg",
      alt: "notwork etkinliğinde networking yapan katılımcılar",
      label: "match",
      position: "center 48%",
    },
    {
      src: "/community/27.jpg",
      alt: "notwork Sahne gecesinin community atmosferi",
      label: "community",
      position: "center 46%",
    },
    {
      src: "/events/9-ekim/rene-lokal-1.mp4",
      poster: "/events/9-ekim/rene-lokal-1-poster.jpg",
      alt: "11 Ekim notwork Sahne etkinlik mekânı Rene Lokal bahçesi",
      label: "mekân",
      mediaType: "video",
      title: "rene lokal",
      subtitle: "11 ekim · 19.30 · notwork sahne",
      muted: true,
      position: "center",
    },
    {
      src: "/events/9-ekim/classic-son-video.mp4",
      poster: "/events/9-ekim/classic-son-video-poster.jpg",
      alt: "notwork Sahne etkinliğinde başarısızlık hikâyesini anlatan konuşmacı",
      label: "sahne",
      mediaType: "video",
      title: "rene lokal",
      subtitle: "başarısızlık hikâyelerinden gerçek bir an",
      autoPlay: true,
      muted: true,
      loop: true,
      controls: false,
      position: "center",
    },
    {
      src: "/events/9-ekim/notwork-roportaj.mp4",
      poster: "/events/9-ekim/notwork-roportaj-poster.jpg",
      alt: "notwork community etkinlik röportajı",
      label: "röportaj",
      mediaType: "video",
      title: "notwork röportajı",
      subtitle: "community etkinlik deneyimini anlatıyor",
      autoPlay: false,
      muted: false,
      loop: false,
      controls: true,
      position: "center",
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
      note: "Birlikte gel, kişi başı 550 TL",
      price: 1100,
      badge: "100 TL avantaj",
    },
  ],
  ticketGift: "Her bilete ntw sticker paketi + ntw anahtarlık hediye.",
  ticketUrl:
    "https://www.biletimgo.com/etkinlik/notwork-basarisizlik-hikayeleri-network-event-30395",
  flowEyebrow: "notwork sahne akışı",
  flowTitleLines: ["Başarısızlık hikâyeleri", "ve gerçek networking."],
  flowDescription:
    "Önce mikrofon size uzanır. Ardından dört gerçek hikâye dinler, notwork match ile doğru kişilerle eşleşir ve geceyi serbest networking ile tamamlarsınız.",
  flow: [
    {
      time: "19.39",
      duration: "interaktif kısım",
      product: "ntw.wordcloud",
      title: "Mikrofonu size uzatıyoruz.",
      description:
        "Ekranda sorular görünür. Telefonunuzdan verdiğiniz cevaplar anında birleşir; odanın ortak düşüncesi canlı olarak büyür.",
      highlights: ["interaktif sorular", "ortak cevaplar ekranda"],
      icon: Cloud,
      accent: "bg-[#b8eff0] text-[#07353a]",
    },
    {
      time: "20.00",
      duration: "ilk iki sunum",
      product: "2 ilham veren hikâye",
      title: "İlk iki başarısızlık hikâyesi.",
      description:
        "İlk iki konuşmacı sahneye çıkar. Denediklerini, olduramadıklarını ve bu süreçten çıkardıkları gerçek dersleri anlatır.",
      highlights: ["ilk 2 konuşmacı", "gerçek hikâyeler"],
      icon: Mic2,
      accent: "bg-[#ffd1e5] text-[#63233f]",
    },
    {
      time: "20.45",
      duration: "30 dakika",
      product: "notwork match",
      title: "Eşleştirme sistemi devreye girer.",
      description:
        "Uygulamamız sizi ihtiyaçlarınıza ve sunabileceklerinize göre üç kişilik bir grupla eşleştirir. Kiminle ve neden tanıştığınızı görürsünüz.",
      highlights: ["3 kişilik eşleşme", "neden eşleştiğiniz görünür"],
      icon: UsersRound,
      accent: "bg-[#d8c6ff] text-[#392263]",
    },
    {
      time: "21.15",
      duration: "iki yeni sunum",
      product: "2 ilham veren hikâye",
      title: "İki yeni başarısızlık hikâyesi.",
      description:
        "İkinci bölümde iki yeni konuşmacı sahneye çıkar ve kendi kırılma noktalarını, hatalarını ve öğrendiklerini paylaşır.",
      highlights: ["2 yeni konuşmacı", "yeni deneyimler"],
      icon: MessageCircleQuestion,
      accent: "bg-[#ffe5a8] text-[#61450a]",
    },
    {
      time: "22.00",
      duration: "60 dakika",
      product: "gerçek networking",
      title: "Gece gerçek bağlantılarla devam eder.",
      description:
        "Eşleştiğiniz kişilerle sohbeti sürdürür, konuşmacılarla tanışır ve gecenin kalanında yeni bağlantılar kurarsınız.",
      highlights: ["yüz yüze sohbet", "serbest networking"],
      icon: Sparkles,
      accent: "bg-[#c9f1d7] text-[#174d2d]",
    },
  ],
  flowLayoutClass: "lg:grid-cols-3 xl:grid-cols-5",
  communityEyebrow: "sahne geceden fazlası",
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
  beforeLoad: () => {
    throw redirect({ to: "/11-ekim", replace: true });
  },
  head: () =>
    createSeo({
      title: "11 Ekim notwork Sahne | İzmir Networking Etkinliği",
      description:
        "11 Ekim’de Rene Lokal’de dört başarısızlık hikâyesi, canlı WordCloud, ntw.match.lab ve networking deneyimini bir araya getiren notwork Sahne’ye katıl.",
      path: "/9-ekim",
      keywords: [
        "9 Ekim İzmir etkinlik",
        "notwork Sahne",
        "Rene Lokal etkinlik",
        "İzmir networking etkinliği",
        "başarısızlık hikayeleri",
      ],
      type: "article",
      structuredData: createEventStructuredData({
        name: "notwork Sahne",
        description:
          "Dört başarısızlık hikâyesi, canlı ntw.wordcloud, ntw.match.lab ve networking deneyimini bir araya getiren notwork Sahne etkinliği.",
        path: "/9-ekim",
        startDate: "2026-10-09T19:30:00+03:00",
        endDate: "2026-10-09T23:00:00+03:00",
        venueName: "Rene Lokal",
        addressLocality: "Bornova",
        images: ["/notwork-social.png", "/community/8.jpg", "/community/21.jpg"],
        ticketUrl: eventConfig.ticketUrl || "https://notwork.me/9-ekim",
        lowPrice: 600,
        highPrice: 1100,
        videos: [
          {
            name: "Rene Lokal etkinlik mekânı",
            description: "11 Ekim notwork Sahne etkinlik mekânı Rene Lokal'in kısa videosu.",
            contentUrl: "/events/9-ekim/rene-lokal-1.mp4",
            thumbnailUrl: "/events/9-ekim/rene-lokal-1-poster.jpg",
            uploadDate: "2026-08-27",
          },
          {
            name: "notwork Sahne etkinlik deneyimi",
            description: "notwork Sahne etkinliğinden ve community deneyiminden gerçek bir an.",
            contentUrl: "/events/9-ekim/classic-son-video.mp4",
            thumbnailUrl: "/events/9-ekim/classic-son-video-poster.jpg",
            uploadDate: "2026-08-28",
          },
        ],
      }),
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
