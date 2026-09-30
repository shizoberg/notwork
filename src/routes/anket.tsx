import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getMyMemberProfile } from "@/lib/member-profile-api";
import {
  submitPostEventSurvey,
  type PostEventSurveyInput,
  type SurveyFollowUp,
} from "@/lib/post-event-survey";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/anket")({
  head: () =>
    createNoIndexSeo({
      title: "notwork etkinlik sonrası",
      description: "Etkinlik sonrası deneyimini paylaş.",
      path: "/anket",
    }),
  component: SurveyPage,
});

const eventOptions = [
  { id: "17-eylul-2026", label: "17 Eylül · Fast" },
  { id: "11-ekim-2026", label: "11 Ekim · Sahne" },
  { id: "21-agustos-2026", label: "21 Ağustos · notwork" },
];
const followUps: Array<{ value: SurveyFollowUp; label: string; detail: string }> = [
  { value: "none", label: "henüz değil", detail: "iletişim kurulmadı" },
  { value: "planning", label: "planlıyoruz", detail: "yeniden görüşme niyetimiz var" },
  { value: "messaged", label: "yazıştık", detail: "etkinlikten sonra iletişim kurduk" },
  { value: "met", label: "tekrar buluştuk", detail: "notwork dışında da görüştük" },
  {
    value: "ongoing",
    label: "birlikte üretiyoruz",
    detail: "işbirliği veya düzenli iletişim başladı",
  },
];

type Draft = PostEventSurveyInput;
const initial: Draft = {
  eventId: "17-eylul-2026",
  overallRating: 0,
  connectionRating: 0,
  continuedConnectionRating: 0,
  followUp: "" as SurveyFollowUp,
  outcome: "",
};

function Rating({
  value,
  onChange,
  low,
  high,
}: {
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`aspect-square rounded-2xl border text-xl font-black transition ${value === score ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(46,183,232,.28)]" : "border-border/80 bg-white/65 text-foreground hover:border-primary/50"}`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[11px] font-semibold text-foreground/40">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function SurveyPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const total = 5;

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("event");
    if (eventOptions.some((item) => item.id === requested))
      setDraft((current) => ({ ...current, eventId: requested || current.eventId }));
    getMyMemberProfile()
      .then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));
  }, []);

  useEffect(() => {
    if (!complete) return;
    const target = hasProfile ? "/profil" : "/profil?next=/networking";
    const timer = window.setTimeout(() => window.location.assign(target), 3500);
    return () => window.clearTimeout(timer);
  }, [complete, hasProfile]);

  const valid = useMemo(
    () =>
      [
        draft.overallRating > 0,
        draft.connectionRating > 0,
        draft.continuedConnectionRating > 0,
        Boolean(draft.followUp),
        draft.outcome.trim().length >= 3,
      ][step],
    [draft, step],
  );
  const finish = async () => {
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      await submitPostEventSurvey({ ...draft, outcome: draft.outcome.trim() });
      localStorage.setItem("notwork-survey-completed", new Date().toISOString());
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Yanıtların kaydedilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  if (complete)
    return (
      <main className="grid min-h-[100svh] place-items-center overflow-hidden bg-[#eef7f8] px-5 text-foreground">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/75 p-7 text-center shadow-[0_30px_90px_rgba(16,35,39,.14)] backdrop-blur-2xl">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-8 w-8" />
          </div>
          <p className="relative mt-7 text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
            yanıtın kaydedildi
          </p>
          <h1 className="relative mt-3 font-display text-4xl font-black tracking-[-0.05em]">
            şimdi bağını büyüt
          </h1>
          <p className="relative mt-4 text-sm leading-6 text-foreground/60">
            Profilini tamamladığında tanıştığın insanlar seni yeniden bulabilir bağlantılar
            etkinlikten sonra da devam eder
          </p>
          <p className="relative mt-3 text-xs font-semibold text-foreground/40">
            birkaç saniye içinde profiline geçiyorsun
          </p>
          <a
            href={hasProfile ? "/profil" : "/profil?next=/networking"}
            className="relative mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-4 font-black text-background"
          >
            {hasProfile ? "profilimi güncelle" : "notwork kaydımı tamamla"}
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/"
            className="relative mt-4 inline-block text-xs font-semibold text-foreground/45"
          >
            şimdilik ana sayfaya dön
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-[100svh] overflow-hidden bg-[#eef7f8] px-4 py-5 text-foreground sm:grid sm:place-items-center">
      <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-primary/20 blur-[90px]" />
      <section className="relative mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 p-5 shadow-[0_30px_90px_rgba(16,35,39,.12)] backdrop-blur-2xl sm:min-h-0 sm:p-7">
        <header>
          <div className="flex items-center justify-between">
            <Link to="/" className="font-brand text-xl">
              notwork
            </Link>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-primary-deep">
              etkinlik sonrası
            </span>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/8">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black tabular-nums text-foreground/45">
              {step + 1}/{total}
            </span>
          </div>
        </header>

        <div key={step} className="survey-step-enter flex flex-1 flex-col justify-center py-9">
          {step === 0 && (
            <>
              <p className="text-xs font-black uppercase tracking-[.2em] text-primary-deep">
                deneyim
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-[-.05em]">
                Etkinlik deneyimini nasıl puanlarsın
              </h1>
              <p className="mt-4 text-sm text-foreground/55">
                Genel akışı ortamı ve sende bıraktığı hissi düşün
              </p>
              <div className="mt-8">
                <Rating
                  value={draft.overallRating}
                  onChange={(overallRating) => setDraft({ ...draft, overallRating })}
                  low="beklentimin altında"
                  high="çok iyiydi"
                />
              </div>
              <label className="mt-7 grid gap-2 text-xs font-bold text-foreground/50">
                Hangi etkinlik
                <select
                  value={draft.eventId}
                  onChange={(event) => setDraft({ ...draft, eventId: event.target.value })}
                  className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                >
                  {eventOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-xs font-black uppercase tracking-[.2em] text-primary-deep">
                bağlantılar
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-[-.05em]">
                Tanıştığın bağlantıları nasıl puanlarsın
              </h1>
              <p className="mt-4 text-sm text-foreground/55">
                Sana uygun insanlarla karşılaşma kalitesini düşün
              </p>
              <div className="mt-8">
                <Rating
                  value={draft.connectionRating}
                  onChange={(connectionRating) => setDraft({ ...draft, connectionRating })}
                  low="uygun değildi"
                  high="tam aradığım"
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-xs font-black uppercase tracking-[.2em] text-primary-deep">
                devamlılık
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-[-.05em]">
                Etkinlikten sonra bağın ne kadar devam etti
              </h1>
              <p className="mt-4 text-sm text-foreground/55">
                notwork üyeleriyle yeniden konuşma görüşme ve kaynaşma seviyeni puanla
              </p>
              <div className="mt-8">
                <Rating
                  value={draft.continuedConnectionRating}
                  onChange={(continuedConnectionRating) =>
                    setDraft({ ...draft, continuedConnectionRating })
                  }
                  low="devam etmedi"
                  high="aktif devam ediyor"
                />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-xs font-black uppercase tracking-[.2em] text-primary-deep">
                etkinlikten sonra
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-[-.05em]">
                Tanıştığın biriyle bağın nasıl ilerledi
              </h1>
              <div className="mt-7 grid gap-2">
                {followUps.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setDraft({ ...draft, followUp: item.value })}
                    className={`rounded-2xl border p-4 text-left transition ${draft.followUp === item.value ? "border-primary bg-primary/12" : "border-border bg-white/60"}`}
                  >
                    <span className="block font-black">{item.label}</span>
                    <span className="mt-1 block text-xs text-foreground/45">{item.detail}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-xs font-black uppercase tracking-[.2em] text-primary-deep">
                sende kalan
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-[-.05em]">
                notwork’ten sonra sende kalan en somut şey ne oldu
              </h1>
              <p className="mt-4 text-sm text-foreground/55">
                Bir insan bir fikir bir işbirliği ya da değişmesini istediğin bir şey olabilir
              </p>
              <textarea
                autoFocus
                rows={6}
                value={draft.outcome}
                onChange={(event) =>
                  setDraft({ ...draft, outcome: event.target.value.slice(0, 800) })
                }
                placeholder="kısaca anlat"
                className="mt-7 resize-none rounded-[1.5rem] border border-border bg-white/70 p-4 text-base leading-6 outline-none focus:border-primary"
              />
              <div className="mt-2 flex items-start justify-between gap-4">
                <p className="max-w-xs text-[11px] leading-4 text-foreground/35">
                  Yanıtların etkinlik deneyimini geliştirmek için kullanılır ve admin panelinde
                  saklanır{" "}
                  <Link to="/kvkk" className="underline">
                    KVKK
                  </Link>
                </p>
                <span className="shrink-0 text-[11px] text-foreground/35">
                  {draft.outcome.length}/800
                </span>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mb-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
        <footer className="flex items-center gap-3">
          <button
            type="button"
            disabled={step === 0 || submitting}
            onClick={() => setStep(step - 1)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-white disabled:opacity-25"
            aria-label="Önceki soru"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!valid || submitting}
            onClick={() => (step === total - 1 ? void finish() : setStep(step + 1))}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 font-black text-background transition disabled:opacity-30"
          >
            {submitting ? "kaydediliyor" : step === total - 1 ? "anketi tamamla" : "devam et"}
            {step === total - 1 ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </footer>
      </section>
    </main>
  );
}
