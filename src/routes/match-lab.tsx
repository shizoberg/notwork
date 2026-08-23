import { Link, createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, CheckCircle2, Network, ScanLine, ShieldCheck, Users } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/match-lab")({
  head: () => ({
    meta: [
      { title: "ntw.match.lab v1.0 | notwork AI Networking Eşleştirme Sistemi" },
      {
        name: "description",
        content:
          "ntw.match.lab v1.0; notwork etkinliklerinde katılımcıların niyet, ihtiyaç ve katkı alanlarına göre doğru üçlü networking grupları oluşturan AI destekli eşleştirme sistemi.",
      },
      { property: "og:title", content: "ntw.match.lab v1.0 | notwork" },
      {
        property: "og:description",
        content:
          "notwork etkinliklerinde doğru insanları sıkıcı olmayan şekilde buluşturan AI destekli networking algoritması.",
      },
      { property: "og:url", content: "https://notwork.me/match-lab" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/match-lab" }],
  }),
  component: MatchLabPage,
});

const steps = [
  {
    icon: ScanLine,
    title: "01 · hızlı kayıt",
    text: "Katılımcı; kendini, ne aradığını ve topluluğa ne katabileceğini birkaç kısa cevapla sisteme bırakır.",
  },
  {
    icon: BrainCircuit,
    title: "02 · bağlam okuma",
    text: "Sistem cevaplardan rol, ihtiyaç, yetenek, sektör ve niyet sinyallerini çıkarır; ortak bağlamları eşleştirir.",
  },
  {
    icon: Users,
    title: "03 · üçlü grup",
    text: "Herkes sadece iki kişiyle değil, daha canlı akacak üçlü mini gruplarla tanışır. Amaç sohbetin hemen başlamasıdır.",
  },
  {
    icon: CheckCircle2,
    title: "04 · network done",
    text: "Grup görüşmesini bitirince herkes tamamladı der; sonra sistem boştaki kişilerle yeni bir eşleşme önerebilir.",
  },
];

const signals = [
  "ne istiyorsun?",
  "ne yapabilirsin?",
  "hangi alandasın?",
  "kimlerle tanışman anlamlı?",
  "şu an görüşmeye açık mısın?",
];

function MatchLabPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_34%),var(--background)] text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              <Network className="h-4 w-4" />
              AI entegreli network eşleştirme sistemi
            </div>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              ntw.match.lab <span className="text-primary-deep">v1.0</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              notwork etkinliklerinde insanları sadece mesleklerine göre değil; ne aradıklarına, ne
              katabileceklerine ve hangi sohbetin gerçekten anlamlı olacağına göre eşleştiren
              sistemimiz.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/linkler"
                className="rounded-full bg-primary px-6 py-3.5 text-center font-black text-primary-foreground shadow-[var(--shadow-soft)]"
              >
                etkinlik girişine git
              </Link>
              <Link
                to="/community"
                className="rounded-full border border-primary/30 bg-card px-6 py-3.5 text-center font-black"
              >
                community’ye dön
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">
                  amaç
                </div>
                <div className="text-2xl font-black tracking-[-0.04em]">
                  sıkıcı olmayan doğru bağ
                </div>
              </div>
            </div>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Kalabalık etkinliklerde herkes herkesi bulamaz. Match Lab, “şu kişiyle mutlaka
              konuşmalısın” hissini yazılımla hızlandırır; sahada daha az rastgele, daha çok anlamlı
              tanışma yaratır.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {signals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full bg-background px-4 py-2 text-sm font-bold"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-14 sm:pb-20">
          <div className="mb-6">
            <div className="text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
              algoritma akışı
            </div>
            <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              nasıl çalışıyor?
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-[1.7rem] border border-border bg-card p-5 shadow-sm sm:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
