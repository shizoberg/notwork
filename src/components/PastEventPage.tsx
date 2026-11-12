import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, ArrowRight } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export function PastEventPage({
  title,
  date,
  venue,
  photos,
  german = false,
  english = false,
}: {
  title: string;
  date: string;
  venue: string;
  photos: string[];
  german?: boolean;
  english?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav german={german} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-deep">
          {english ? "Past event" : german ? "Vergangenes Event" : "Geçmiş etkinlik"}
        </p>
        <h1 className="mt-3 font-brand text-5xl sm:text-7xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {date} · {venue}
        </p>
        <p className="mt-5 max-w-xl text-muted-foreground">
          {english ? "Keep in touch and follow us for upcoming meetups and community news." : german
            ? "Die Kontakte bleiben. Folge uns für neue Treffen und Nachrichten aus der Community."
            : "Etkinlik bitti, bağlantılar devam ediyor. Yeni buluşmalar ve topluluktan haberler için bizi takip et."}
        </p>
        <div className="my-6 flex flex-wrap gap-3">
          <a
            href="https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
          >
            <MessageCircle size={18} />
            {english ? "Join the WhatsApp group" : german ? "WhatsApp-Gruppe beitreten" : "WhatsApp topluluğuna katıl"}
          </a>
          <a
            href="https://www.instagram.com/notwork.ntw/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-5 py-3 text-sm font-semibold"
          >
            <Instagram size={18} />
            {english ? "Follow on Instagram" : german ? "Auf Instagram folgen" : "Instagram’da takip et"}
          </a>
          <Link
            to={english ? "/en/events" : german ? "/de/events" : "/etkinlikler"}
            className="inline-flex items-center gap-2 px-3 py-3 text-sm font-semibold"
          >
            {english ? "Upcoming events" : german ? "Kommende Events" : "Yeni etkinlikler"} <ArrowRight size={16} />
          </Link>
        </div>
        <h2 className="mb-4 mt-10 text-xl font-semibold">
          {english ? "Photos from notwork" : german ? "Impressionen von notwork" : "notwork gecelerinden"}
        </h2>
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
          {photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${english ? "Photo from the notwork community" : german ? "Foto aus der notwork Community" : "notwork topluluğundan bir kare"} · ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              className="mb-3 w-full break-inside-avoid rounded-2xl sm:mb-4"
            />
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-primary/10 p-6 text-center">
          <p className="mb-4 font-semibold">
            {english ? "See you at the next meetup." : german ? "Bis zum nächsten Treffen." : "Bir sonraki buluşmada görüşelim."}
          </p>
          <a
            href="https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE"
            target="_blank"
            rel="noreferrer"
            className="text-primary-deep underline underline-offset-4"
          >
            {english ? "Get updates on WhatsApp" : german ? "Neuigkeiten auf WhatsApp" : "WhatsApp grubundan haberdar ol"}
          </a>
        </div>
      </main>
      <SiteFooter german={german} />
    </div>
  );
}
