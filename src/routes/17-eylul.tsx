import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Music2, UsersRound } from "lucide-react";

import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";

const eventConfig: EventProductConfig = {
  eventLabel: "yeni etkinlik",
  imageTitle: "chill & chat",
  imageSubtitle: "17 eylül · 20.00 · alsancak köşk",
  titleLines: ["chill", "& chat"],
  description:
    "ntw.match.lab ile sana uygun bağlantıları bul, ntw.five ile gerçek problemlere beş dakikalık çözümler üret; geceyi DJ ve özgür sohbetle tamamla.",
  date: "17 Eylül 2026",
  day: "Perşembe",
  time: "20.00",
  timeDetail: "Kapı açılışı",
  venue: "Köşk Alsancak",
  venueUrl: "https://share.google/gNcA5ZyamrCE1HvXR",
  city: "İzmir",
  experienceLabel: "Networking + DJ & live müzik",
  experienceDetail: "Eşleşme, çözüm ve özgür sohbet",
  gallery: [
    {
      src: "/events/17-eylul/alsancak-kosk.mp4",
      poster: "/events/17-eylul/alsancak-kosk-poster.jpg",
      alt: "17 Eylül notwork Chill & Chat etkinlik mekânı Alsancak Köşk",
      label: "mekân",
      mediaType: "video",
      title: "alsancak köşk",
      subtitle: "17 eylül · 20.00 · chill & chat",
      position: "center",
    },
    {
      src: "/community/17.jpg",
      alt: "notwork etkinliğinde sohbet eden katılımcılar",
      label: "chill",
      position: "center 42%",
    },
    {
      src: "/community/23.jpg",
      alt: "notwork etkinliğinde birebir networking görüşmesi",
      label: "match",
      position: "center 48%",
    },
    {
      src: "/community/27.jpg",
      alt: "notwork gecesinde kalabalık katılımcı alanı",
      label: "community",
      position: "center 46%",
    },
    {
      src: "/community/8.jpg",
      alt: "notwork sahnesinde interaktif anlatım",
      label: "talk",
      position: "center 42%",
    },
  ],
  tickets: [
    {
      id: "single",
      name: "Tek kişilik",
      note: "Etkinlik girişi + tüm deneyimler",
      price: 450,
    },
    {
      id: "duo",
      name: "İki kişilik",
      note: "Birlikte gel, kişi başı 400 TL",
      price: 800,
      badge: "100 TL avantaj",
    },
  ],
  ticketUrl: "https://www.biletimgo.com/etkinlik/notwork-chill-amp-chat-networking-event-30394",
  flowEyebrow: "bir gecede üç ritim",
  flowTitleLines: ["Önce eşleş.", "Sonra çöz. En son akışa bırak."],
  flowDescription:
    "İki ntw ürünü geceyi rastlantıya bırakmaz: önce doğru kişiler, sonra gerçek problemlere kısa ve odaklı görüşmeler.",
  flow: [
    {
      time: "20.00",
      duration: "ilk 60 dakika",
      product: "ntw.match.lab",
      title: "Kalabalıkta sana uygun kişileri bul.",
      description:
        "Niyet, ihtiyaç ve katkı alanlarına göre üç kişilik gruplar oluşturur. Kiminle ve neden tanışacağını önceden netleştirir.",
      highlights: ["3 kişilik doğru grup", "niyet + ihtiyaç eşleşmesi"],
      icon: UsersRound,
      accent: "bg-[#b8eff0] text-[#07353a]",
    },
    {
      time: "21.00",
      duration: "sonraki 90 dakika",
      product: "ntw.five",
      title: "Gerçek problemi beş dakikada ilerlet.",
      description:
        "Problemini havuza bırak, çözüm üretebilecek kişilerle görüş. Beş dakikada dinle, katkı ver ve sonraki adımı birlikte belirle.",
      highlights: ["gerçek problem havuzu", "5 dakikalık çözüm görüşmesi"],
      icon: Clock3,
      accent: "bg-[#d8c6ff] text-[#392263]",
    },
    {
      time: "22.30",
      duration: "gecenin devamı",
      product: "notwork club",
      title: "Chill, chat ve DJ ile akışa bırak.",
      description:
        "Eşleşmeler biter, müzik yükselir. Tanıştığın insanlarla sohbeti sürdürür ve geceyi DJ set ile birlikte kapatırsın.",
      highlights: ["DJ set", "serbest sohbet"],
      icon: Music2,
      accent: "bg-[#ffd1e5] text-[#63233f]",
    },
  ],
  flowLayoutClass: "lg:grid-cols-3",
  communityGallery: [
    "/community/16.jpg",
    "/community/19.jpg",
    "/community/22.jpg",
    "/community/24.jpg",
    "/community/25.jpg",
    "/community/17.jpg",
  ],
};

export const Route = createFileRoute("/17-eylul")({
  head: () =>
    createSeo({
      title: "17 Eylül notwork Chill & Chat | İzmir Networking Etkinliği",
      description:
        "17 Eylül’de Köşk Alsancak’ta ntw.match.lab, ntw.five, DJ ve gerçek networking deneyimini bir araya getiren notwork Chill & Chat etkinliğine katıl.",
      path: "/17-eylul",
      keywords: [
        "17 Eylül İzmir etkinlik",
        "notwork Chill and Chat",
        "Alsancak networking etkinliği",
        "İzmir network club",
      ],
      type: "article",
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
