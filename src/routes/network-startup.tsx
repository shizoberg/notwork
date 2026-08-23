import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createNoIndexSeo } from "@/lib/seo";

const notificationEmails = ["berk@carewithki.com", "berkaktas@windowslive.com"];

export const Route = createFileRoute("/network-startup")({
  head: () =>
    createNoIndexSeo({
      title: "notwork Startup Başvurusu",
      description:
        "Startup projesini anlat, pazarlama ihtiyacını paylaş ve notwork ağı üzerinden doğru bağlantılarla destek al.",
      path: "/network-startup",
      canonicalPath: "/startup",
    }),
  component: NetworkStartupPage,
});

export function NetworkStartupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectName: "",
    stage: "fikir",
    projectSummary: "",
    need: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/startup-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(await response.text());

      setStatus("sent");
      setMessage("Başvurun alındı. Admin panele düştü; bildirim mailleri Berk’e yönlendirildi.");
      setForm({
        name: "",
        email: "",
        phone: "",
        projectName: "",
        stage: "fikir",
        projectSummary: "",
        need: "",
      });
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "Başvuru şu anda alınamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-10 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Network Startup
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-7xl">
              Projeni anlat, doğru bağlantıyı birlikte arayalım.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/65 sm:text-lg">
              Kendi işini geliştirmek, kendi işini kurmak veya kendi başarı hikâyesini yazmak
              isteyen insanlara network olarak destek olmak istiyoruz. Başlangıç hedefim basit:
              talebi görmek, önce bir webinar yapmak ve sonrasında bu topluluğu fiziksel bir
              etkinliğe taşımak.
            </p>

            <article className="mt-8 rounded-[2rem] border border-primary/25 bg-primary/10 p-5 shadow-sm sm:p-7">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                Berk Aktaş — notwork kurucu ortağı
              </div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-foreground/70 sm:text-base">
                <p>
                  Ben Berk Aktaş. 15 yaşımdan beri startup kültürünün içindeyim; farklı projeler
                  ürettim, birçok kez denedim, birçok kez de battım. Bu yüzden bir projeyi
                  büyütürken bağlantının, insan tanımanın ve projeyi doğru anlatmanın ne kadar güçlü
                  olduğunu yaşayarak biliyorum.
                </p>
                <p>
                  Bugün yapay zekâ ile pek çok şey üretilebilir hale geldi; ama pazarlama, doğru
                  kişiye ulaşmak ve projeyi anlaşılır şekilde anlatmak hâlâ ayrı bir mesele.
                  Biliyorum ki çoğu projenin en büyük problemi de burada başlıyor.
                </p>
                <p className="font-bold text-foreground">
                  Bu yüzden projeni anlatmanı istiyorum. Sana bağlantılar bulmaya çalışacağım ve
                  formu gönderen bütün startuplarla, bütün projelerle online meet yapacağım.
                </p>
              </div>
            </article>
          </div>

          <form
            aria-label="Network Startup formu"
            onSubmit={onSubmit}
            className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7"
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              Projeni gönder
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Online meet için başvur</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/55">
              Kısa yazman yeterli. Amacım projeni anlamak ve sana yardımcı olabilecek bağlantıları
              düşünmek.
            </p>

            <div className="mt-6 grid gap-4">
              <Field label="Ad Soyad">
                <input
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Adın ve soyadın"
                  className="startup-input"
                />
              </Field>
              <Field label="E-posta">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ornek@email.com"
                  className="startup-input"
                />
              </Field>
              <Field label="Telefon / WhatsApp (opsiyonel)">
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="05xx xxx xx xx"
                  className="startup-input"
                />
              </Field>
              <Field label="Proje / startup adı">
                <input
                  value={form.projectName}
                  onChange={set("projectName")}
                  placeholder="Varsa proje adın"
                  className="startup-input"
                />
              </Field>
              <Field label="Şu an hangi aşamadasın?">
                <select value={form.stage} onChange={set("stage")} className="startup-input">
                  <option value="fikir">Fikir aşaması</option>
                  <option value="mvp">MVP / ilk ürün</option>
                  <option value="satış">İlk satış / müşteri arayışı</option>
                  <option value="büyüme">Büyüme ve pazarlama</option>
                </select>
              </Field>
              <Field label="Projeni kısaca anlat">
                <textarea
                  required
                  rows={5}
                  value={form.projectSummary}
                  onChange={set("projectSummary")}
                  placeholder="Ne yapıyorsun, kime çözüm üretiyorsun, şu an neredesin?"
                  className="startup-input resize-none"
                />
              </Field>
              <Field label="En çok hangi konuda bağlantı / destek arıyorsun?">
                <textarea
                  rows={4}
                  value={form.need}
                  onChange={set("need")}
                  placeholder="Pazarlama, müşteri bulma, yatırım, ekip, mentor, satış, içerik..."
                  className="startup-input resize-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 w-full rounded-full bg-primary px-6 py-4 text-sm font-black text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              {status === "sending" ? "Başvuru gönderiliyor…" : "Projemi Berk’e gönder"}
            </button>
            {message ? (
              <p
                className={`mt-3 rounded-2xl px-4 py-3 text-center text-xs font-bold leading-5 ${
                  status === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary-deep"
                }`}
              >
                {message}
              </p>
            ) : null}
            <p className="mt-3 text-center text-xs leading-5 text-foreground/45">
              Başvurular admin panele kaydedilir ve{" "}
              <span className="font-bold text-foreground">{notificationEmails.join(" / ")}</span>{" "}
              adreslerine bildirim olarak iletilir.
            </p>
          </form>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .startup-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .startup-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 4px color-mix(in oklab, hsl(var(--primary)) 18%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground/75">{label}</span>
      {children}
    </label>
  );
}
