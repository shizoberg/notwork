import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Music2,
  Sparkles,
  Ticket,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

const ticketUrl = "";

const gallery = [
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
];

const ticketOptions = [
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
] as const;

const flow = [
  {
    time: "20.00",
    duration: "ilk 60 dakika",
    product: "ntw.match.lab",
    title: "Doğru insanı kalabalığın içinde bul.",
    description:
      "Niyetin, ihtiyacın ve sunabileceğin katkıya göre seni uygun kişilerle eşleştiriyoruz. Kartvizit toplamadan önce gerçek bir bağ kuruyorsun.",
    icon: UsersRound,
    accent: "bg-[#b8eff0] text-[#07353a]",
  },
  {
    time: "21.00",
    duration: "sonraki 90 dakika",
    product: "ntw.five",
    title: "Beş dakikada gerçek bir probleme yaklaş.",
    description:
      "İş hayatındaki gerçek problemini paylaş, çözüm sunabilecek kişilerle buluş. Ya kendi sorununda ilerle ya da başka birine çözüm ol.",
    icon: Clock3,
    accent: "bg-[#d8c6ff] text-[#392263]",
  },
  {
    time: "22.30",
    duration: "gecenin devamı",
    product: "notwork club",
    title: "Chill, chat ve DJ ile geceyi serbest bırak.",
    description:
      "Eşleşmeler biter, müzik yükselir. Tanıştığın insanlarla sohbeti sürdürür; DJ set ile notwork gecesini birlikte kapatırsın.",
    icon: Music2,
    accent: "bg-[#ffd1e5] text-[#63233f]",
  },
];

const communityGallery = [
  "/community/16.jpg",
  "/community/19.jpg",
  "/community/22.jpg",
  "/community/24.jpg",
  "/community/25.jpg",
  "/community/17.jpg",
];

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
  component: SeptemberSeventeenthPage,
});

function SeptemberSeventeenthPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<(typeof ticketOptions)[number]["id"]>(
    "single",
  );
  const selectedOption =
    ticketOptions.find((option) => option.id === selectedTicket) || ticketOptions[0];

  const moveGallery = (direction: number) => {
    setActiveImage((current) => (current + direction + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(143,203,208,0.32),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(255,171,207,0.24),transparent_27%),linear-gradient(180deg,#f8fbfa_0%,#eef6f5_100%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/etkinlikler"
                className="inline-flex items-center gap-2 text-sm font-black text-foreground/60 transition hover:text-primary-deep"
              >
                <ArrowLeft size={16} /> Etkinliklere dön
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/65 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-deep backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary blink" /> Yeni etkinlik
              </div>
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-10">
              <EventGallery
                activeImage={activeImage}
                onSelect={setActiveImage}
                onMove={moveGallery}
              />
              <PurchasePanel
                selectedTicket={selectedTicket}
                selectedOption={selectedOption}
                onTicketChange={setSelectedTicket}
              />
            </div>
          </div>
        </section>

        <EventFlow />
        <CommunitySection />
      </main>
      <SiteFooter />
    </div>
  );
}

function EventGallery({
  activeImage,
  onSelect,
  onMove,
}: {
  activeImage: number;
  onSelect: (index: number) => void;
  onMove: (direction: number) => void;
}) {
  const image = gallery[activeImage];

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#0a1618] shadow-[0_30px_90px_rgba(15,45,50,0.18)] sm:rounded-[2.5rem]">
        <div className="aspect-[4/5] max-h-[760px] w-full sm:aspect-[5/6] lg:aspect-[4/5]">
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover animate-in fade-in duration-300"
            style={{ objectPosition: image.position }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071416]/75 via-transparent to-black/5" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md sm:left-7 sm:top-7">
          notwork / {image.label}
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
          <div className="text-white">
            <div className="font-brand text-4xl sm:text-6xl">chill & chat</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-white/70">
              17 eylül · alsancak
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMove(-1)}
              aria-label="Önceki görsel"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              aria-label="Sonraki görsel"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-ink"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {gallery.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${index + 1}. etkinlik görselini aç`}
            className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 transition sm:rounded-3xl ${
              activeImage === index
                ? "border-primary shadow-[0_10px_30px_rgba(77,175,184,0.24)]"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <img
              src={item.src}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: item.position }}
            />
            <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PurchasePanel({
  selectedTicket,
  selectedOption,
  onTicketChange,
}: {
  selectedTicket: (typeof ticketOptions)[number]["id"];
  selectedOption: (typeof ticketOptions)[number];
  onTicketChange: (id: (typeof ticketOptions)[number]["id"]) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-[2rem] border border-white/90 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,45,50,0.12)] backdrop-blur-xl sm:p-7 lg:rounded-[2.5rem]">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-background">
            notwork experience
          </span>
          <span className="rounded-full bg-[#d8c6ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#392263]">
            limited capacity
          </span>
        </div>

        <h1 className="mt-5 font-display text-[clamp(3.1rem,7vw,5.4rem)] font-black leading-[0.84] tracking-[-0.075em]">
          chill
          <br />& chat
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Match Lab ile doğru bağlantılar, ntw.five ile gerçek problemlere beş dakikalık çözümler
          ve gecenin sonunda DJ eşliğinde özgür sohbet.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
          <EventMeta icon={CalendarDays} label="17 Eylül 2026" detail="Perşembe" />
          <EventMeta icon={Clock3} label="20.00" detail="Kapı açılışı" />
          <div className="col-span-2">
            <EventMeta icon={MapPin} label="Köşk Alsancak" detail="İzmir" />
          </div>
        </div>

        <div id="biletler" className="mt-7 scroll-mt-24">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                biletini seç
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Tüm deneyimler bilete dahil.</div>
            </div>
            <Ticket className="text-primary-deep" size={24} />
          </div>

          <div className="mt-4 grid gap-2.5">
            {ticketOptions.map((option) => {
              const selected = selectedTicket === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onTicketChange(option.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/10 shadow-[0_12px_35px_rgba(77,175,184,0.14)]"
                      : "border-border bg-background hover:border-primary/45"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-primary bg-primary" : "border-border bg-white"
                    }`}
                  >
                    {selected ? <Check size={13} strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-black">{option.name}</span>
                      {"badge" in option && option.badge ? (
                        <span className="rounded-full bg-[#ffd1e5] px-2 py-0.5 text-[10px] font-black text-[#63233f]">
                          {option.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.note}</span>
                  </span>
                  <span className="shrink-0 text-lg font-black">{option.price} TL</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              toplam
            </div>
            <div className="mt-1 text-3xl font-black tracking-[-0.04em]">
              {selectedOption.price} TL
            </div>
          </div>
          <div className="text-right text-xs leading-relaxed text-muted-foreground">
            Güvenli ödeme
            <br />
            bilet platformunda
          </div>
        </div>

        {ticketUrl ? (
          <a
            href={ticketUrl}
            target="_blank"
            rel="noreferrer"
            data-analytics="ticket_click"
            data-analytics-label={`17 Eylül ${selectedOption.name} bilet`}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4 text-base font-black text-background transition hover:-translate-y-0.5 hover:bg-primary-deep"
          >
            Bileti al <ArrowRight size={18} />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-foreground/85 px-5 py-4 text-base font-black text-background/80"
          >
            Bilet bağlantısı yakında <Sparkles size={18} />
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
          <Check size={14} className="text-primary-deep" /> Kontenjan sınırlıdır
          <span>·</span>
          <Check size={14} className="text-primary-deep" /> Tüm deneyimler dahil
        </div>
      </div>
    </aside>
  );
}

function EventMeta({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof CalendarDays;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-background/70 p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-deep">
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block font-black leading-tight">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
      </span>
    </div>
  );
}

function EventFlow() {
  return (
    <section className="border-b border-border/60 bg-[#071416] px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-[#8fcbd0]">
              bir gecede üç ritim
            </div>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Önce eşleş.
              <br />
              Sonra çöz. En son akışa bırak.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            Klasik bir networking gecesi değil. Her bölüm bir sonrakine hazırlanan lineer bir deneyim
            olarak tasarlandı.
          </p>
        </div>

        <div className="relative mt-10 grid gap-3 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-[#8fcbd0] via-[#d8c6ff] to-[#ffd1e5] lg:block" />
          {flow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.product}
                className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 backdrop-blur sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl ${item.accent}`}
                  >
                    <Icon size={23} />
                  </span>
                  <span className="font-display text-5xl font-black tracking-[-0.08em] text-white/10">
                    0{index + 1}
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.17em]">
                  <span className="text-[#8fcbd0]">{item.time}</span>
                  <span className="text-white/20">/</span>
                  <span className="text-white/45">{item.duration}</span>
                </div>
                <div className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-white/45">
                  {item.product}
                </div>
                <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.035em]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/55">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="overflow-hidden bg-[#f4f8f7] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              <Sparkles size={14} /> bir geceden fazlası
            </div>
            <h2 className="mt-5 font-brand text-5xl leading-[0.85] sm:text-7xl">
              notwork community
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground sm:text-lg">
              Bir gecede tanışıp kaybolmak yerine, doğru bağlantıları community içinde büyütüyoruz.
              Etkinlik biter; sohbet, network ağı ve yeni buluşmalar devam eder.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-black text-background transition hover:bg-primary-deep"
              >
                Community’ye katıl <ArrowRight size={16} />
              </Link>
              <Link
                to="/networking"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-black transition hover:border-primary"
              >
                Network ağını gör
              </Link>
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="flex min-w-max gap-3">
              {communityGallery.map((src, index) => (
                <div
                  key={src}
                  className={`relative w-[42vw] min-w-36 max-w-52 overflow-hidden rounded-[1.75rem] border border-white bg-[#0a1618] shadow-[var(--shadow-card)] ${
                    index % 2 === 1 ? "mt-8" : ""
                  }`}
                >
                  <div className="aspect-[4/5]">
                    <img
                      src={src}
                      alt="notwork community etkinlik anı"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                    notwork / {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
