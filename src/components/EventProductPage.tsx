import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Sparkles,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { SiteFooter, SiteNav } from "@/components/SiteNav";

export type EventGalleryImage = {
  src: string;
  alt: string;
  label: string;
  position?: string;
};

export type EventTicketOption = {
  id: string;
  name: string;
  note: string;
  price: number;
  badge?: string;
};

export type EventFlowStep = {
  time: string;
  duration: string;
  product: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  highlights?: string[];
};

export type EventProductConfig = {
  eventLabel: string;
  imageTitle: string;
  imageSubtitle: string;
  titleLines: string[];
  description: string;
  date: string;
  day: string;
  time: string;
  timeDetail: string;
  venue: string;
  city: string;
  capacityLabel?: string;
  gallery: EventGalleryImage[];
  tickets: EventTicketOption[];
  ticketUrl?: string;
  flowEyebrow: string;
  flowTitleLines: string[];
  flowDescription: string;
  flow: EventFlowStep[];
  flowLayoutClass?: string;
  communityEyebrow?: string;
  communityTitle?: string;
  communityDescription?: string;
  communityGallery: string[];
};

export function EventProductPage({ config }: { config: EventProductConfig }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(config.tickets[0]?.id || "");
  const selectedOption =
    config.tickets.find((option) => option.id === selectedTicket) || config.tickets[0];

  const moveGallery = (direction: number) => {
    setActiveImage(
      (current) => (current + direction + config.gallery.length) % config.gallery.length,
    );
  };

  if (!selectedOption) return null;

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(143,203,208,0.32),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(255,171,207,0.24),transparent_27%),linear-gradient(180deg,#f8fbfa_0%,#eef6f5_100%)]" />
          <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-5 sm:gap-3">
              <Link
                to="/etkinlikler"
                className="inline-flex items-center gap-2 text-sm font-black text-foreground/60 transition hover:text-primary-deep"
              >
                <ArrowLeft size={16} /> Etkinliklere dön
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/65 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-deep backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary blink" /> {config.eventLabel}
              </div>
            </div>

            <div className="grid items-start gap-4 sm:gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-10">
              <EventGallery
                gallery={config.gallery}
                imageTitle={config.imageTitle}
                imageSubtitle={config.imageSubtitle}
                activeImage={activeImage}
                onSelect={setActiveImage}
                onMove={moveGallery}
              />
              <PurchasePanel
                config={config}
                selectedTicket={selectedTicket}
                selectedOption={selectedOption}
                onTicketChange={setSelectedTicket}
              />
            </div>
          </div>
        </section>

        <EventFlow config={config} />
        <CommunitySection config={config} />
      </main>
      <FloatingTicketCta config={config} selectedOption={selectedOption} />
      <SiteFooter />
    </div>
  );
}

function EventGallery({
  gallery,
  imageTitle,
  imageSubtitle,
  activeImage,
  onSelect,
  onMove,
}: {
  gallery: EventGalleryImage[];
  imageTitle: string;
  imageSubtitle: string;
  activeImage: number;
  onSelect: (index: number) => void;
  onMove: (direction: number) => void;
}) {
  const image = gallery[activeImage];
  if (!image) return null;

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[1.55rem] border border-white/80 bg-[#0a1618] shadow-[0_22px_64px_rgba(15,45,50,0.16)] sm:rounded-[2.5rem] sm:shadow-[0_30px_90px_rgba(15,45,50,0.18)]">
        <div className="aspect-[5/6] max-h-[760px] w-full sm:aspect-[5/6] lg:aspect-[4/5]">
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover animate-in fade-in duration-300"
            style={{ objectPosition: image.position }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071416]/75 via-transparent to-black/5" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md sm:left-7 sm:top-7 sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.2em]">
          notwork / {image.label}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7 sm:gap-4">
          <div className="text-white">
            <div className="font-brand text-3xl sm:text-6xl">{imageTitle}</div>
            <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/70 sm:mt-1 sm:text-xs sm:tracking-[0.22em]">
              {imageSubtitle}
            </div>
          </div>
          <div className="flex gap-2">
            <GalleryButton label="Önceki görsel" onClick={() => onMove(-1)}>
              <ArrowLeft size={18} />
            </GalleryButton>
            <GalleryButton label="Sonraki görsel" onClick={() => onMove(1)}>
              <ArrowRight size={18} />
            </GalleryButton>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5 sm:mt-3 sm:gap-3">
        {gallery.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${index + 1}. etkinlik görselini aç`}
            className={`relative aspect-[5/4] overflow-hidden rounded-xl border-2 transition sm:aspect-[4/5] sm:rounded-3xl ${
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
            <span className="absolute bottom-1 left-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white backdrop-blur sm:bottom-2 sm:left-2 sm:px-2 sm:py-1 sm:text-[9px] sm:tracking-[0.14em]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-ink sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}

function PurchasePanel({
  config,
  selectedTicket,
  selectedOption,
  onTicketChange,
}: {
  config: EventProductConfig;
  selectedTicket: string;
  selectedOption: EventTicketOption;
  onTicketChange: (id: string) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-[1.55rem] border border-white/90 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,45,50,0.1)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7 sm:shadow-[0_25px_80px_rgba(15,45,50,0.12)] lg:rounded-[2.5rem]">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-background">
            notwork experience
          </span>
          <span className="rounded-full bg-[#d8c6ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#392263]">
            {config.capacityLabel || "limited capacity"}
          </span>
        </div>

        <h1 className="mt-3 font-display text-[2.4rem] font-black leading-[0.82] tracking-[-0.075em] sm:mt-5 sm:text-[clamp(3.1rem,7vw,5.4rem)]">
          {config.titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          {config.description}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-1.5 text-xs sm:mt-6 sm:grid-cols-2 sm:gap-2 sm:text-sm">
          <EventMeta icon={CalendarDays} label={config.date} detail={config.day} />
          <EventMeta icon={Clock3} label={config.time} detail={config.timeDetail} />
          <div className="sm:col-span-2">
            <EventMeta icon={MapPin} label={config.venue} detail={config.city} />
          </div>
        </div>

        <div id="biletler" className="mt-5 scroll-mt-24 sm:mt-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                biletini seç
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Tüm deneyimler bilete dahil.</div>
            </div>
            <Ticket className="text-primary-deep" size={24} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-1 sm:gap-2.5">
            {config.tickets.map((option) => {
              const selected = selectedTicket === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onTicketChange(option.id)}
                  className={`relative flex min-h-28 w-full flex-col items-start gap-2 rounded-2xl border p-3 text-left transition sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${
                    selected
                      ? "border-primary bg-primary/10 shadow-[0_12px_35px_rgba(77,175,184,0.14)]"
                      : "border-border bg-background hover:border-primary/45"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:static ${
                      selected ? "border-primary bg-primary" : "border-border bg-white"
                    }`}
                  >
                    {selected ? <Check size={13} strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0 flex-1 pr-5 sm:pr-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-black">{option.name}</span>
                      {option.badge ? (
                        <span className="rounded-full bg-[#ffd1e5] px-2 py-0.5 text-[10px] font-black text-[#63233f]">
                          {option.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option.note}
                    </span>
                  </span>
                  <span className="mt-auto shrink-0 text-lg font-black sm:mt-0">
                    {option.price} TL
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4 sm:mt-5 sm:pt-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              toplam
            </div>
            <div className="mt-0.5 text-2xl font-black tracking-[-0.04em] sm:mt-1 sm:text-3xl">
              {selectedOption.price} TL
            </div>
          </div>
          <div className="text-right text-xs leading-relaxed text-muted-foreground">
            Güvenli ödeme
            <br />
            bilet platformunda
          </div>
        </div>

        <TicketButton config={config} selectedOption={selectedOption} />

        <p className="mt-2 text-center text-[10px] font-semibold leading-relaxed text-muted-foreground sm:text-xs">
          Bilet al dediğinde güvenli ödeme için BiletimGO sayfasına yönlendirileceksin.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground sm:mt-4 sm:gap-2 sm:text-xs">
          <Check size={14} className="text-primary-deep" /> Kontenjan sınırlıdır
          <span>·</span>
          <Check size={14} className="text-primary-deep" /> Tüm deneyimler dahil
        </div>
      </div>
    </aside>
  );
}

function TicketButton({
  config,
  selectedOption,
}: {
  config: EventProductConfig;
  selectedOption: EventTicketOption;
}) {
  if (config.ticketUrl) {
    return (
      <a
        href={config.ticketUrl}
        target="_blank"
        rel="noreferrer"
        data-analytics="ticket_click"
        data-analytics-label={`${config.date} ${selectedOption.name} bilet`}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4 text-base font-black text-background transition hover:-translate-y-0.5 hover:bg-primary-deep"
      >
        Bileti al <ArrowRight size={18} />
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="mt-5 flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-foreground/85 px-5 py-4 text-base font-black text-background/80"
    >
      Bilet bağlantısı yakında <Sparkles size={18} />
    </button>
  );
}

function EventMeta({
  icon: Icon,
  label,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex min-h-16 flex-col items-start gap-1.5 rounded-xl border border-border bg-background/70 p-2 sm:min-h-20 sm:flex-row sm:items-center sm:gap-3 sm:rounded-2xl sm:p-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-deep sm:h-10 sm:w-10 sm:rounded-xl">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black leading-tight sm:text-base">{label}</span>
        <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{detail}</span>
      </span>
    </div>
  );
}

function EventFlow({ config }: { config: EventProductConfig }) {
  return (
    <section className="border-b border-border/60 bg-[#071416] px-3 py-10 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-[#8fcbd0]">
              {config.flowEyebrow}
            </div>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-black leading-[0.9] tracking-[-0.055em] sm:mt-4 sm:text-6xl">
              {config.flowTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            {config.flowDescription}
          </p>
        </div>

        <div
          className={`relative -mx-3 mt-7 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:mt-10 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0 ${
            config.flowLayoutClass || "lg:grid-cols-3"
          }`}
        >
          <div className="absolute left-[10%] right-[10%] top-9 hidden h-px bg-gradient-to-r from-[#8fcbd0] via-[#d8c6ff] to-[#ffd1e5] lg:block" />
          {config.flow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={`${item.time}-${item.product}`}
                className="relative w-[78vw] min-w-[78vw] snap-start overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-4 backdrop-blur sm:w-[48vw] sm:min-w-[48vw] lg:w-auto lg:min-w-0 lg:rounded-[2rem] lg:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-xl lg:h-14 lg:w-14 lg:rounded-2xl ${item.accent}`}
                  >
                    <Icon size={23} />
                  </span>
                  <span className="font-display text-5xl font-black tracking-[-0.08em] text-white/10">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] lg:mt-8 lg:text-xs lg:tracking-[0.17em]">
                  <span className="text-[#8fcbd0]">{item.time}</span>
                  <span className="text-white/20">/</span>
                  <span className="text-white/45">{item.duration}</span>
                </div>
                <div className="mt-3 inline-flex rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                  {item.product}
                </div>
                <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.035em] lg:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-white/55 lg:text-sm">
                  {item.description}
                </p>
                {item.highlights?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-white/[0.075] px-2.5 py-1 text-[9px] font-bold text-white/65"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CommunitySection({ config }: { config: EventProductConfig }) {
  return (
    <section className="overflow-hidden bg-[#f4f8f7] px-3 py-10 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              <Sparkles size={14} /> {config.communityEyebrow || "bir geceden fazlası"}
            </div>
            <h2 className="mt-3 font-brand text-4xl leading-[0.85] sm:mt-5 sm:text-7xl">
              {config.communityTitle || "notwork community"}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {config.communityDescription ||
                "Bir gecede tanışıp kaybolmak yerine, doğru bağlantıları community içinde büyütüyoruz. Etkinlik biter; sohbet, network ağı ve yeni buluşmalar devam eder."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-black text-background transition hover:bg-primary-deep sm:px-5 sm:py-3 sm:text-sm"
              >
                Community’ye katıl <ArrowRight size={16} />
              </Link>
              <Link
                to="/networking"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-black transition hover:border-primary sm:px-5 sm:py-3 sm:text-sm"
              >
                Network ağını gör
              </Link>
            </div>
          </div>

          <div className="-mx-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="flex min-w-max gap-3">
              {config.communityGallery.map((src, index) => (
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

function FloatingTicketCta({
  config,
  selectedOption,
}: {
  config: EventProductConfig;
  selectedOption: EventTicketOption;
}) {
  const className =
    "fixed bottom-3 left-1/2 z-40 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#071416]/94 px-4 py-3 text-sm font-black text-white shadow-[0_18px_55px_rgba(5,22,24,0.3)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-primary-deep sm:bottom-6 sm:min-h-14 sm:px-5";
  const content = (
    <>
      <Ticket size={17} /> Bilet al
      <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] text-white/75">
        {selectedOption.price} TL
      </span>
    </>
  );

  if (config.ticketUrl) {
    return (
      <a
        href={config.ticketUrl}
        target="_blank"
        rel="noreferrer"
        data-analytics="ticket_click"
        data-analytics-label={`${config.date} sabit ${selectedOption.name} bilet`}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <a href="#biletler" className={className} aria-label="Bilet seçeneklerine git">
      {content}
    </a>
  );
}
