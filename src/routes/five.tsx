import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck2,
  Check,
  CircleDot,
  Clock3,
  Radio,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { SiteFooter, SiteNav } from "@/components/SiteNav";
import {
  fiveCategories,
  fiveCategoryLabel,
  fiveRequest,
  type FiveCategory,
  type FivePublicPayload,
} from "@/lib/five";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/five")({
  head: () =>
    createSeo({
      title: "ntw.five | Problemini 5 Dakikada İleri Taşı",
      description:
        "Problemini etkinlikten önce paylaş. Notwork community içindeki doğru kişilerle beş dakikalık çözüm görüşmelerine hazırlan.",
      path: "/five",
    }),
  component: FiveHypePage,
});

type FiveForm = {
  name: string;
  email: string;
  title: string;
  description: string;
  tried: string;
  desiredOutcome: string;
  category: FiveCategory;
  attending: boolean;
  consent: boolean;
  website: string;
};

const initialForm: FiveForm = {
  name: "",
  email: "",
  title: "",
  description: "",
  tried: "",
  desiredOutcome: "",
  category: "startup",
  attending: false,
  consent: false,
  website: "",
};

function FiveHypePage() {
  const [form, setForm] = useState<FiveForm>(initialForm);
  const [board, setBoard] = useState<FivePublicPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  const loadBoard = async () => {
    try {
      setBoard(await fiveRequest<FivePublicPayload>());
    } catch {
      setBoard(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBoard();
  }, []);

  const update = <Key extends keyof FiveForm>(key: Key, value: FiveForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await fiveRequest<{ problem: { shortCode: string } }>({
        action: "submitPublic",
        ...form,
      });
      setCreatedCode(result.problem.shortCode);
      setForm(initialForm);
      await loadBoard();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Problem kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fbfb] text-[#071213]">
      <SiteNav />
      <main>
        <section className="relative isolate overflow-hidden bg-[#061112] text-white">
          <div className="five-orb five-orb-one" />
          <div className="five-orb five-orb-two" />
          <div className="five-grid" />
          <div className="relative mx-auto grid min-h-[34rem] max-w-6xl items-center gap-10 px-5 py-16 sm:min-h-[44rem] sm:py-24 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#9af0ed]/20 bg-[#9af0ed]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#aef7f2] backdrop-blur-xl sm:text-xs">
                <Radio className="h-3.5 w-3.5" /> problem pool açık
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-[4rem] font-black leading-[0.78] tracking-[-0.075em] sm:text-8xl lg:text-[7.5rem]">
                ntw.
                <span className="text-[#78d9da]">five</span>
              </h1>
              <p className="mt-7 max-w-xl text-xl font-black leading-tight tracking-[-0.035em] text-white sm:text-3xl">
                Bir problemi dinle. Beş dakikada ilerlet.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/58 sm:text-lg">
                Etkinlikten önce problemini bırak. Community içindeki deneyim, bağlantı ve farklı
                bakışlar sinyallerine göre doğru kişilerle buluşmaya hazır olsun.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <a
                  href="#problem-birak"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#78d9da] px-5 py-3 text-sm font-black text-[#061112] transition hover:-translate-y-0.5"
                >
                  problemini bırak <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/five/live"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/14"
                >
                  etkinlik günü giriş <UsersRound className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <LiveSignalCard board={board} isLoading={isLoading} />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 sm:py-20 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
              nasıl çalışır?
            </div>
            <h2 className="mt-3 font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">
              problem önce görünür olur.
            </h2>
            <div className="mt-6 grid gap-2.5">
              {[
                ["01", "problemini yaz", "Neyi çözmek istediğini ve şimdiye kadar ne denediğini anlat."],
                ["02", "sinyaller oluşsun", "Sistem ihtiyaç, sektör ve beklenen sonuç sinyallerini hazırlar."],
                ["03", "beş dakika buluş", "Etkinlikte sana gerçekten katkı sunabilecek kişiler talep yollar."],
              ].map(([number, title, text]) => (
                <article key={number} className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="font-display text-2xl font-black text-primary-deep">{number}</span>
                    <div>
                      <h3 className="font-black">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id="problem-birak" className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_24px_70px_rgba(4,35,38,0.09)]">
            {createdCode ? (
              <div className="flex min-h-[34rem] flex-col items-center justify-center px-6 py-14 text-center sm:px-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary text-primary-foreground">
                  <Check className="h-7 w-7" strokeWidth={3} />
                </div>
                <div className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                  problem havuza girdi
                </div>
                <div className="mt-3 font-display text-7xl font-black tracking-[-0.07em] sm:text-8xl">
                  {createdCode}
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Bu kodu sakla. Etkinlik günü aynı e-posta ile giriş yaptığında problemin profilinle
                  eşleşecek ve gelen çözüm taleplerini göreceksin.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreatedCode("")}
                    className="rounded-full border border-border px-5 py-3 text-sm font-black"
                  >
                    başka problem ekle
                  </button>
                  <Link
                    to="/five/live"
                    className="rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
                  >
                    etkinlik akışını gör
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                      problem formu
                    </div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                      Neyi ilerletmek istiyorsun?
                    </h2>
                  </div>
                  <Sparkles className="h-6 w-6 shrink-0 text-primary-deep" />
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <FiveField label="ad soyad">
                    <input
                      required
                      minLength={2}
                      maxLength={80}
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      className="profile-input"
                      placeholder="seni nasıl tanıyalım?"
                    />
                  </FiveField>
                  <FiveField label="e-posta">
                    <input
                      required
                      type="email"
                      maxLength={120}
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      className="profile-input"
                      placeholder="etkinlik günü eşleşmek için"
                    />
                  </FiveField>
                  <FiveField label="kategori">
                    <select
                      value={form.category}
                      onChange={(event) => update("category", event.target.value as FiveCategory)}
                      className="profile-input appearance-none"
                    >
                      {fiveCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </FiveField>
                  <FiveField label="problem başlığı" helper={`${form.title.length}/60 · min. 6`}>
                    <input
                      required
                      minLength={6}
                      maxLength={60}
                      value={form.title}
                      onChange={(event) => update("title", event.target.value)}
                      className="profile-input"
                      placeholder="tek cümlede problem"
                    />
                  </FiveField>
                </div>

                <div className="mt-4 grid gap-4">
                  <FiveField label="problemini anlat" helper={`${form.description.length}/240 · min. 24`}>
                    <textarea
                      required
                      minLength={24}
                      maxLength={240}
                      rows={4}
                      value={form.description}
                      onChange={(event) => update("description", event.target.value)}
                      className="profile-input resize-none"
                      placeholder="bağlamı, seni zorlayan noktayı ve neden önemli olduğunu anlat"
                    />
                  </FiveField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FiveField label="şimdiye kadar ne denedin?" helper={`${form.tried.length}/140 · min. 8`}>
                      <textarea
                        required
                        minLength={8}
                        maxLength={140}
                        rows={3}
                        value={form.tried}
                        onChange={(event) => update("tried", event.target.value)}
                        className="profile-input resize-none"
                        placeholder="denediğin yollar ve tıkandığın yer"
                      />
                    </FiveField>
                    <FiveField label="5 dakika sonunda ne olsun?" helper={`${form.desiredOutcome.length}/100 · min. 8`}>
                      <textarea
                        required
                        minLength={8}
                        maxLength={100}
                        rows={3}
                        value={form.desiredOutcome}
                        onChange={(event) => update("desiredOutcome", event.target.value)}
                        className="profile-input resize-none"
                        placeholder="bağlantı, fikir, geri bildirim veya sonraki adım"
                      />
                    </FiveField>
                  </div>
                </div>

                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                  className="absolute -left-[9999px]"
                />

                <div className="mt-5 grid gap-2.5">
                  <FiveCheck
                    checked={form.attending}
                    onChange={(checked) => update("attending", checked)}
                    icon={<CalendarCheck2 className="h-4 w-4" />}
                    label="Etkinliğe geleceğim; problemim canlı eşleşme havuzunda yer alsın."
                  />
                  <FiveCheck
                    checked={form.consent}
                    onChange={(checked) => update("consent", checked)}
                    required
                    label={
                      <span>
                        Verilerimin etkinlik içi eşleşme amacıyla işlenmesini ve problemimin adımın
                        ilk kısmıyla görünmesini onaylıyorum. <Link to="/kvkk" className="underline">KVKK</Link>
                      </span>
                    }
                  />
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                ) : null}

                <button type="submit" disabled={isSubmitting} className="profile-primary-button mt-5 w-full sm:w-auto">
                  {isSubmitting ? "sinyaller hazırlanıyor..." : "problemi havuza bırak"}
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </section>

        <ProblemBoard board={board} isLoading={isLoading} />
      </main>
      <SiteFooter />
    </div>
  );
}

function LiveSignalCard({ board, isLoading }: { board: FivePublicPayload | null; isLoading: boolean }) {
  const total = board?.stats.total || 0;
  const attending = board?.stats.attending || 0;
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#aef7f2]">
          <CircleDot className="h-3.5 w-3.5 animate-pulse" /> ntw intelligence
        </div>
        <span className="rounded-full bg-[#78d9da]/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#aef7f2]">
          canlı
        </span>
      </div>
      <div className="mt-5 rounded-3xl border border-white/8 bg-[#0b1b1c]/82 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#78d9da] text-[#061112]">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="font-black">eşleşme sinyalleri hazırlanıyor</div>
            <div className="mt-0.5 text-xs text-white/45">ihtiyaç · deneyim · bağlantı</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/6 p-3">
            <div className="font-display text-3xl font-black tracking-[-0.05em]">{isLoading ? "—" : total}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">açık problem</div>
          </div>
          <div className="rounded-2xl bg-[#78d9da] p-3 text-[#061112]">
            <div className="font-display text-3xl font-black tracking-[-0.05em]">{isLoading ? "—" : attending}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-50">etkinlikte olacak</div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-xs text-white/52">
        <Clock3 className="h-4 w-4 text-[#78d9da]" /> Her görüşme 5 dakika; iki taraf isterse +5.
      </div>
    </div>
  );
}

function ProblemBoard({ board, isLoading }: { board: FivePublicPayload | null; isLoading: boolean }) {
  const rows = board?.problems.slice(0, 8) || [];
  return (
    <section className="bg-[#071213] py-12 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#78d9da]">
              <Radio className="h-4 w-4" /> problem pool
            </div>
            <h2 className="mt-3 font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">
              odada bunlar konuşulacak.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/50">
            Şimdilik yalnızca ilk ad ve problem görünür. İletişim bilgileri paylaşılmaz.
          </p>
        </div>

        <div className="-mx-5 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {isLoading ? (
            [0, 1, 2, 3].map((value) => <div key={value} className="h-64 w-[82vw] max-w-sm shrink-0 animate-pulse rounded-[1.7rem] bg-white/8 sm:w-auto" />)
          ) : rows.length ? (
            rows.map((problem) => (
              <article key={problem.id} className="flex min-h-64 w-[82vw] max-w-sm shrink-0 snap-start flex-col rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl sm:w-auto">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#78d9da] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#071213]">
                    {problem.shortCode}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.13em] text-white/35">
                    {fiveCategoryLabel(problem.category)}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black leading-tight tracking-[-0.035em]">{problem.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/50">{problem.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-xs font-bold text-white/42">
                  <span>{problem.ownerFirstName}</span>
                  {problem.attending ? <span className="text-[#78d9da]">etkinlikte</span> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-[1.7rem] border border-dashed border-white/15 px-5 py-12 text-center text-sm text-white/45">
              İlk problemi bırakan kişi sen olabilirsin.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FiveField({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
        {label}
        {helper ? <span className="text-[10px] font-bold text-muted-foreground">{helper}</span> : null}
      </span>
      {children}
    </label>
  );
}

function FiveCheck({ checked, onChange, label, icon, required = false }: { checked: boolean; onChange: (checked: boolean) => void; label: React.ReactNode; icon?: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-3.5 text-sm leading-relaxed">
      <input type="checkbox" checked={checked} required={required} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#6cc5c8]" />
      <span className="flex min-w-0 gap-2 font-semibold text-muted-foreground">
        {icon ? <span className="mt-0.5 shrink-0 text-primary-deep">{icon}</span> : null}
        {label}
      </span>
    </label>
  );
}
