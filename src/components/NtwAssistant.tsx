import { Link } from "@tanstack/react-router";
import { useState } from "react";

const prompts = [
  {
    id: "about",
    question: "notwork nedir?",
    answer:
      "notwork bir networking club’dır ama bildiğiniz türden değil. Burada hatalarımızı, yaptığımız yanlışları ve başarısızlıklarımızdan çıkardığımız derslerle bugün geldiğimiz noktaları konuşuyoruz. Kısacası fck-up nights diyebilirsiniz.",
    cta: "Ana sayfayı incele",
    href: "/",
  },
  {
    id: "network",
    question: "Network genişletmek mi istiyorsun?",
    answer:
      "notwork ağına katılıp profilini ekleyebilir, ortak ilgi ve yeteneklere göre yeni insanlarla tanışabilirsin.",
    cta: "Networking sayfasına git",
    href: "/networking",
  },
  {
    id: "sponsor",
    question: "Sponsor mu olmak istiyorsun?",
    answer:
      "Markanı etkinlik deneyimine, içerik üretimine veya meslek bazlı özel notwork formatlarına bağlayabiliriz.",
    cta: "Sponsorluğu incele",
    href: "/sponsor",
  },
  {
    id: "events",
    question: "Etkinlikler hakkında bilgi mi almak istiyorsun?",
    answer:
      "Yaklaşan etkinliklerin programını, bilet bağlantılarını ve topluluk linklerini hızlıca görebilirsin.",
    cta: "Etkinlik sayfasına git",
    href: "/14temmuz",
  },
] as const;

export function NtwAssistant() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<(typeof prompts)[number]["id"]>("about");
  const activePrompt = prompts.find((prompt) => prompt.id === activeId) || prompts[0];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="ntw asistan arka planını kapat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-background/45 backdrop-blur-[3px] transition"
        />
      )}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {open && (
          <div className="w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-3xl border border-primary/35 bg-background/98 shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--primary)_65%,#000)] ring-1 ring-background/80 backdrop-blur-2xl">
            <div className="border-b border-border/70 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0">
                  <NtwMascotSvg compact />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">selam ben ntw 👋</div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/60">
                    Site içinde doğru yere hızlıca gidelim. Ne yapmak istiyorsun?
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 p-3">
              {prompts.map((prompt) => {
                const active = prompt.id === activeId;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => setActiveId(prompt.id)}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground/70 hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {prompt.question}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border/70 p-4">
              <p className="text-sm leading-relaxed text-foreground/65">{activePrompt.answer}</p>
              <Link
                to={activePrompt.href}
                className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition hover:opacity-90"
              >
                {activePrompt.cta}
              </Link>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "ntw asistanı kapat" : "ntw asistanı aç"}
          aria-expanded={open}
          className="group relative h-20 w-20 rounded-full border border-primary/30 bg-background shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-primary sm:h-24 sm:w-24"
        >
          <span className="absolute -left-2 -top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-black text-primary-foreground shadow-md">
            ntw
          </span>
          <NtwMascotSvg />
        </button>
      </div>
    </>
  );
}

function NtwMascotSvg({ compact = false }: { compact?: boolean }) {
  const gradientId = compact ? "ntwAssistantBodyCompact" : "ntwAssistantBody";
  const screenId = compact ? "ntwAssistantScreenCompact" : "ntwAssistantScreen";

  return (
    <svg viewBox="0 0 160 160" role="img" className="h-full w-full drop-shadow-xl">
      <defs>
        <linearGradient id={gradientId} x1="26" x2="130" y1="24" y2="145">
          <stop offset="0" stopColor="#bfeff1" />
          <stop offset="0.52" stopColor="#8fcbd0" />
          <stop offset="1" stopColor="#5aa7ba" />
        </linearGradient>
        <linearGradient id={screenId} x1="46" x2="120" y1="48" y2="94">
          <stop offset="0" stopColor="#142643" />
          <stop offset="1" stopColor="#1d315a" />
        </linearGradient>
      </defs>
      <path
        d="M46 35c5-17 24-22 37-12 11-13 36-4 37 15 17 2 24 18 15 32 9 12 2 31-13 34-1 20-24 29-39 17-15 12-38 2-40-17-17-4-23-24-12-36-9-11-2-29 15-33Z"
        fill={`url(#${gradientId})`}
        stroke="#173f68"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="39"
        y="48"
        width="83"
        height="51"
        rx="15"
        fill={`url(#${screenId})`}
        stroke="#0d203a"
        strokeWidth="5"
      />
      <path
        d="M59 64l13 12-13 12"
        fill="none"
        stroke="#b8fff5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M91 80h17" stroke="#b8fff5" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M51 104c-10 5-15 14-11 23 4 10 18 11 25 3"
        fill="#74b7cf"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M111 104c11 5 16 14 12 23-4 10-18 11-25 3"
        fill="#74b7cf"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M61 121c-5 11-1 21 11 21s17-10 13-21"
        fill="#6eadc8"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M91 121c-4 11 1 21 13 21s16-10 11-21"
        fill="#6eadc8"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="59"
        y="103"
        width="45"
        height="20"
        rx="10"
        fill="#7fd3df"
        stroke="#173f68"
        strokeWidth="4"
      />
      <text
        x="81"
        y="117"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#12324f"
        letterSpacing="1.5"
      >
        ntw
      </text>
    </svg>
  );
}
