import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Layers3,
  LockKeyhole,
  MessageCircleQuestion,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/match-lab")({
  head: () =>
    createSeo({
      title: "AI Networking Eşleştirme | ntw.match.lab",
      description:
        "ntw.match.lab, notwork İzmir network club etkinliklerinde katılımcıların niyet, ihtiyaç ve katkı alanlarına göre doğru üçlü grupları oluşturan AI destekli eşleştirme sistemi.",
      path: "/match-lab",
      keywords: ["AI networking", "networking eşleştirme", "network eşleştirme algoritması"],
    }),
  component: MatchLabPage,
});

const steps = [
  {
    icon: ScanLine,
    number: "01",
    title: "seni tanıyoruz",
    text: "Kendini, aradığın bağlantıyı ve masaya ne koyabileceğini kısa cevaplarla anlatırsın.",
    tag: "yaklaşık 60 saniye",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "bağlamı okuyoruz",
    text: "Sistem rol, sektör, ihtiyaç, yetenek ve niyet sinyallerini birlikte değerlendirir.",
    tag: "çoklu sinyal analizi",
  },
  {
    icon: Users,
    number: "03",
    title: "üçlü grup kuruyoruz",
    text: "Benzer insanları değil, birbirinin ihtiyacını tamamlayabilecek üç kişiyi buluştururuz.",
    tag: "tamamlayıcı eşleşme",
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "grup birlikte ilerliyor",
    text: "Üç kişi görüşmeyi tamamlayınca grup kapanır; müsait olanlar yeni bağlantılara geçebilir.",
    tag: "canlı müsaitlik",
  },
];

const participants = [
  { code: "Q01", name: "ürün geliştiriyor", detail: "pazarlama desteği arıyor" },
  { code: "N14", name: "marka stratejisti", detail: "yeni projelere açık" },
  { code: "A08", name: "topluluk kurucusu", detail: "ürünlere erişim sağlayabilir" },
];

const signals = [
  { label: "niyet", value: "yeni iş bağlantısı", tone: "bg-[#d8fbf7]" },
  { label: "ihtiyaç", value: "pazarlama", tone: "bg-[#fff0c7]" },
  { label: "katkı", value: "ürün + topluluk", tone: "bg-[#e7e3ff]" },
  { label: "müsaitlik", value: "şimdi görüşebilir", tone: "bg-[#dcf6dc]" },
];

const principles = [
  {
    icon: Layers3,
    title: "tek etikete bakmaz",
    text: "Meslek aynı diye insanları yan yana koymaz; bağlantının iki tarafa ne katacağını birlikte okur.",
  },
  {
    icon: Zap,
    title: "sahayı hızlandırır",
    text: "Kalabalıkta kimi bulacağını düşünmek yerine kodunu görür, grubuna gider ve sohbete başlarsın.",
  },
  {
    icon: LockKeyhole,
    title: "kontrol sende kalır",
    text: "Müsaitlik durumunu sen belirlersin. Görüşme bitmeden sistem seni başka bir gruba taşımaz.",
  },
];

function MatchLabPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="overflow-hidden">
        <section className="px-3 pt-3 sm:px-5 sm:pt-5">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-[#071213] text-white shadow-[0_28px_90px_rgba(4,35,38,0.2)] sm:rounded-[3rem]">
            <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#785bff]/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(142,228,232,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(142,228,232,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

            <div className="relative grid gap-6 px-4 py-6 sm:gap-10 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-14 lg:py-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#8ee4e8]/25 bg-[#8ee4e8]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#b9f5f2] sm:px-3.5 sm:py-2 sm:text-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8ee4e8] opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#8ee4e8]" />
                  </span>
                  notwork eşleştirme sistemi
                </div>

                <h1 className="mt-4 max-w-3xl font-display text-[2.7rem] font-black leading-[0.88] tracking-[-0.07em] sm:mt-6 sm:text-7xl lg:text-[6.2rem]">
                  ntw.match.lab
                  <span className="ml-2 inline-block align-top text-base font-black tracking-normal text-[#8ee4e8] sm:ml-3 sm:text-xl">
                    v1.0
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/62 sm:mt-6 sm:text-xl">
                  Kalabalık bir odada şansa güvenme. Ne aradığını ve ne katabileceğini anlayıp seni
                  konuşman gereken insanlarla buluşturuyoruz.
                </p>

                <div className="mt-5 flex sm:mt-7">
                  <a
                    href="#algoritma"
                    className="inline-flex items-center justify-center rounded-full bg-[#8ee4e8] px-5 py-3 text-sm font-black text-[#071213] transition hover:-translate-y-0.5 sm:px-6 sm:py-3.5 sm:text-base"
                  >
                    nasıl çalışıyor?
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-bold text-white/42 sm:mt-8 sm:gap-x-5 sm:gap-y-2 sm:text-xs">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#8ee4e8]" /> üçlü gruplar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#8ee4e8]" /> canlı müsaitlik
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#8ee4e8]" /> akıllı yeniden eşleşme
                  </span>
                </div>
              </div>

              <MatchPreview />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10 sm:py-24">
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                rastgele değil, anlamlı
              </div>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-black leading-[0.95] tracking-[-0.055em] sm:mt-3 sm:text-6xl">
                aynı odadaki doğru insanı bul.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg lg:justify-self-end">
              Match Lab bir kartvizit dağıtma sistemi değil. İhtiyaç ile katkıyı, niyet ile
              müsaitliği aynı anda okuyarak o an konuşması anlamlı olacak insanları birbirine
              yaklaştırır.
            </p>
          </div>

          <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <article
                  key={principle.title}
                  className="group w-[78vw] max-w-[18rem] shrink-0 snap-start rounded-[1.5rem] border border-border bg-card p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/50 sm:p-6 md:w-auto md:max-w-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary-deep">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-4xl font-black tracking-[-0.06em] text-foreground/10">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-black tracking-[-0.035em] sm:mt-6 sm:text-xl">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="algoritma" className="scroll-mt-24 bg-[#eaf8f8] py-10 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                  algoritma akışı
                </div>
                <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.055em] sm:mt-3 sm:text-6xl">
                  dört adım. tek amaç.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Sohbeti teknoloji değil insanlar yapar. Teknoloji sadece doğru başlangıcı daha hızlı
                bulur.
              </p>
            </div>

            <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:mt-9 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="relative w-[78vw] max-w-[18rem] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-primary/20 bg-white p-4 shadow-sm sm:p-6 lg:w-auto lg:max-w-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071213] text-[#8ee4e8]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-3xl font-black tracking-[-0.06em] text-primary/45">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black tracking-[-0.035em] sm:mt-7 sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:min-h-20">
                      {step.text}
                    </p>
                    <div className="mt-4 inline-flex rounded-full bg-background px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary-deep sm:mt-5">
                      {step.tag}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-3 px-5 py-10 sm:gap-5 sm:py-24 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] bg-[#071213] p-5 text-white shadow-[0_24px_70px_rgba(4,35,38,0.16)] sm:rounded-[2rem] sm:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#8ee4e8]">
              <Fingerprint className="h-4 w-4" />
              sistemin okuduğu sinyaller
            </div>
            <h2 className="mt-4 max-w-lg font-display text-3xl font-black leading-[0.95] tracking-[-0.055em] sm:mt-5 sm:text-5xl">
              bir insan, tek bir etiketten fazlasıdır.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/58 sm:mt-4 sm:text-base">
              Unvanına değil, o odada ne aradığına bakıyoruz. Çünkü aynı işi yapan iki kişi değil,
              birbirinin eksik parçasını tamamlayan insanlar daha iyi bağ kurar.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7">
              {signals.map((signal) => (
                <div key={signal.label} className={`rounded-2xl p-3 text-[#071213] ${signal.tone}`}>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] opacity-50">
                    {signal.label}
                  </div>
                  <div className="mt-1 text-sm font-black leading-tight">{signal.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <article className="col-span-2 rounded-[1.5rem] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:rounded-[2rem] sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
                <MessageCircleQuestion className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-black tracking-[-0.04em] sm:mt-5 sm:text-2xl">
                buzları sistem kırar
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Her eşleşmede gruba farklı bir icebreaker sorusu gelir. İlk cümleyi düşünmek yerine
                doğrudan birbirinizi tanımaya başlarsınız.
              </p>
              <div className="mt-4 rounded-2xl bg-background p-3 text-sm font-bold leading-relaxed sm:mt-5 sm:p-4">
                “Son bir yılda vazgeçmeyip devam ettiğin şey neydi?”
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:rounded-[2rem] sm:p-6">
              <Clock3 className="h-6 w-6 text-primary-deep" />
              <div className="mt-3 font-display text-3xl font-black tracking-[-0.06em] sm:mt-5 sm:text-4xl">
                3 kişi
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ne kalabalık ne de kırılgan. Sohbeti akıtacak ideal mini grup.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:rounded-[2rem] sm:p-6">
              <ShieldCheck className="h-6 w-6 text-primary-deep" />
              <div className="mt-3 font-display text-3xl font-black tracking-[-0.06em] sm:mt-5 sm:text-4xl">
                KVKK
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Katılım ve veri paylaşımı açık onayla başlar; kontrol kullanıcıda kalır.
              </p>
            </article>
          </div>
        </section>

        <section className="px-3 pb-4 sm:px-5 sm:pb-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-primary px-5 py-7 text-center text-primary-foreground sm:rounded-[3rem] sm:px-10 sm:py-14">
            <Sparkles className="mx-auto h-6 w-6 sm:h-7 sm:w-7" />
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-black leading-[0.95] tracking-[-0.055em] sm:mt-4 sm:text-6xl">
              doğru bağlantı bazen bir kod uzağında.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/70 sm:mt-4 sm:text-base">
              Match Lab, yalnızca etkinlik günü paylaşılan özel bağlantı ve QR kod üzerinden
              katılımcılara açılır.
            </p>
            <div className="mt-5 flex justify-center sm:mt-7">
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-full bg-[#071213] px-6 py-3.5 font-black text-white"
              >
                community’yi keşfet
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function MatchPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
      <div className="absolute -left-5 top-1/3 z-10 hidden rounded-2xl border border-white/10 bg-[#102425]/90 px-3 py-2 shadow-xl backdrop-blur sm:block">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
          grup durumu
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs font-black text-[#b9f5f2]">
          <span className="h-2 w-2 rounded-full bg-[#8ee4e8]" /> 3/3 müsait
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.07] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-4">
        <div className="flex items-center justify-between px-1.5 py-1.5 sm:px-2 sm:py-2">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8ee4e8]">
              eşleşmen hazır
            </div>
            <div className="mt-0.5 text-base font-black tracking-[-0.03em] sm:mt-1 sm:text-lg">
              grup m-08
            </div>
          </div>
          <div className="rounded-full border border-[#8ee4e8]/25 bg-[#8ee4e8]/10 px-3 py-1.5 text-[10px] font-black text-[#b9f5f2]">
            canlı
          </div>
        </div>

        <div className="mt-1.5 grid gap-1.5 sm:mt-2 sm:gap-2">
          {participants.map((participant, index) => (
            <div
              key={participant.code}
              className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-[#0d1d1e]/82 p-2 sm:gap-3 sm:rounded-2xl sm:p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8ee4e8] font-display text-base font-black tracking-[-0.04em] text-[#071213] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-lg">
                {participant.code}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{participant.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-white/45">
                  {participant.detail}
                </div>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#8ee4e8]/20 bg-[#8ee4e8]/10 text-[10px] font-black text-[#8ee4e8]">
                {index + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-xl bg-[#8ee4e8] p-3 text-[#071213] sm:mt-3 sm:rounded-2xl sm:p-4">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] opacity-55">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> icebreaker
          </div>
          <p className="mt-1.5 text-xs font-black leading-snug sm:mt-2 sm:text-sm">
            “Şu an çözmeye çalıştığın en zor problem ne?”
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-[10px] sm:mt-3 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs">
          <span className="font-bold text-white/46">grup tamamlanma</span>
          <span className="flex items-center gap-1.5 font-black text-[#b9f5f2]">
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-2/3 rounded-full bg-[#8ee4e8]" />
            </span>
            2/3
          </span>
        </div>
      </div>
    </div>
  );
}
