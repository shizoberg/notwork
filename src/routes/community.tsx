import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "notwork Community | Hikâyeni Sahneye Taşı" },
      {
        name: "description",
        content:
          "notwork sahnesine çıkmak için başarısızlıktan öğrendiğin ve başarıya dönüştürdüğün hikâyeni gönder; ekibimiz sana WhatsApp üzerinden ulaşsın.",
      },
      { property: "og:title", content: "notwork Community | Hikâyeni Sahneye Taşı" },
      {
        property: "og:description",
        content: "Denedin, olmadı, öğrendin ve başardın. Şimdi hikâyeni notwork sahnesinde anlat.",
      },
      { property: "og:url", content: "https://notwork.me/community" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "notwork Community | Hikâyeni Sahneye Taşı" },
      {
        name: "twitter:description",
        content: "Hikâyeni gönder, notwork sahnesinde birlikte anlatalım.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/community" }],
  }),
  component: Community,
});

const WHATSAPP_NUMBER = "905457210929";
const CONTACT_EMAIL = "berkaktas@windowslive.com";

function Community() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    track: "ilişki",
    title: "",
    story: "",
    slidesUrl: "",
  });
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `notwork sunum başvurusu — ${form.name}`;
    const body = `Merhaba notwork,

İsim: ${form.name}
Telefon: ${form.phone}
E-posta: ${form.email || "(belirtilmedi)"}
Konu kolu: ${form.track}
Sunum başlığı: ${form.title}

Hikâye:
${form.story}

Sunum linki: ${form.slidesUrl || "(henüz yok)"}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Merhaba, sunum göndermek istiyorum.")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pt-10 sm:pt-16">
          <div className="text-primary-deep font-medium uppercase tracking-widest text-sm">
            Community
          </div>
          <h1 className="mt-2 font-display font-bold text-4xl sm:text-6xl tracking-tight">
            Hikâyeni <span className="text-primary">sahneye</span> taşıyalım.
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl">
            Denedin, olmadı; ama bu deneyimden ne öğrendin ve nasıl başardın? Aşağıdaki formu
            doldur, WhatsApp üzerinden sana dönüyoruz.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-5 mt-10">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-[var(--shadow-card)] space-y-5"
          >
            <Field label="İsmin">
              <input
                required
                name="name"
                value={form.name}
                onChange={set("name")}
                placeholder="Ad Soyad"
                className="nw-input"
              />
            </Field>

            <Field label="Telefon numaran">
              <input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="05xx xxx xx xx"
                className="nw-input"
              />
            </Field>

            <Field label="E-posta adresin (opsiyonel)">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="ornek@email.com"
                className="nw-input"
              />
            </Field>

            <Field label="Hangi kolda?">
              <select name="track" value={form.track} onChange={set("track")} className="nw-input">
                <option value="ilişki">İlişki</option>
                <option value="kariyer">Kariyer</option>
                <option value="macera">Macera</option>
              </select>
            </Field>

            <Field label="Sunum başlığı">
              <input
                required
                name="title"
                value={form.title}
                onChange={set("title")}
                placeholder="Örn: Üç ayda kurduğum şirketi nasıl batırdım"
                className="nw-input"
              />
            </Field>

            <Field label="Hikâyen (kısaca)">
              <textarea
                required
                name="story"
                rows={5}
                value={form.story}
                onChange={set("story")}
                placeholder="Ne denedin, neyi yapamadın, ne öğrendin?"
                className="nw-input resize-none"
              />
            </Field>

            <Field label="Sunum linki (opsiyonel)">
              <input
                name="slidesUrl"
                value={form.slidesUrl}
                onChange={set("slidesUrl")}
                placeholder="Google Slides / Drive / PDF linki"
                className="nw-input"
              />
            </Field>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-[var(--shadow-soft)]"
              >
                E-posta ile gönder →
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-primary/50 text-foreground font-semibold hover:bg-primary/10 transition"
              >
                WhatsApp'tan ulaş
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              E-posta butonu cevaplarını hazır bir mail olarak açar. WhatsApp butonu doğrudan
              iletişime geçmeni sağlar.
            </p>
          </form>

          <div className="mt-10 rounded-2xl bg-primary/10 border border-primary/30 p-6 sm:p-8">
            <div className="font-display font-bold text-xl sm:text-2xl">
              Sahneye çıkmak cesaret ister, biliyoruz.
            </div>
            <p className="mt-2 text-muted-foreground">
              notwork'te kimse mükemmel hikâye anlatmıyor — herkes aynı şeyi yapıyor: denedi,
              olmadı, öğrendi, başardı, anlatıyor. Sen de o kişilerden biri olabilirsin.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .nw-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.85rem;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-size: 0.95rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .nw-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 20%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
