import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";
export const Route = createFileRoute("/duyurular")({
  head: () =>
    createSeo({
      title: "Duyuru tercihleri | notwork",
      description: "notwork etkinlik ve topluluk duyuruları için e-posta tercihini paylaş.",
      path: "/duyurular",
    }),
  component: AnnouncementPreferences,
});
function AnnouncementPreferences() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [noticeRead, setNoticeRead] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/announcements/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          noticeRead,
          marketingOptIn,
          website,
          version: "2026-09-09",
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Lütfen yeniden dene.");
    } finally {
      setBusy(false);
    }
  }
  const field = "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-4xl font-black tracking-tight">haberdar olalım</h1>
        <p className="mt-4 text-muted-foreground">
          yeni etkinlikleri ve notwork’ten haberleri e-postayla almak istersen buradan tercihini
          paylaşabilirsin. üye olmana gerek yok.
        </p>
        <div className="mt-6 rounded-2xl border border-border p-5 text-sm leading-6">
          <p>
            Veri sorumlusu: Berk Aktaş · Kurucu ortak. İletişim:{" "}
            <a className="underline" href="mailto:berk@notwork.me">
              berk@notwork.me
            </a>
          </p>
          <p className="mt-2">
            Adın ve e-posta adresin duyuru tercihini yönetmek ve izin verdiğin etkinlik, bilet ve
            topluluk duyurularını iletmek için kullanılır. İzin vermen siteyi kullanmanın veya
            etkinliklere katılmanın şartı değildir. Her duyurudaki abonelikten çık bağlantısıyla
            ücretsiz ayrılabilirsin.
          </p>
          <p className="mt-2">
            <Link className="underline" to="/kvkk">
              KVKK Aydınlatma Metni
            </Link>{" "}
            ·{" "}
            <Link className="underline" to="/acik-riza">
              Açık Rıza Metni
            </Link>
          </p>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-5">
          <label>
            Ad soyad
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </label>
          <label>
            E-posta
            <input
              className={field}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <div hidden aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              className="mt-1"
              type="checkbox"
              checked={noticeRead}
              onChange={(e) => setNoticeRead(e.target.checked)}
              required
            />
            <span>
              KVKK Aydınlatma Metni’ni okudum ve bilgilendirildim. Bu seçim duyuru izni değildir.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              className="mt-1"
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              required
            />
            <span>
              Adımın ve e-posta adresimin notwork etkinlik, bilet ve topluluk duyuruları için
              kullanılmasına ve bana e-posta ile ticari elektronik ileti gönderilmesine izin
              veriyorum. İzin isteğe bağlıdır; dilediğim zaman ücretsiz ayrılabilirim.
            </span>
          </label>
          <button
            className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "kaydediliyor" : "duyuru tercihimi kaydet"}
          </button>
          {message && (
            <p role="status" className="rounded-xl bg-primary/10 p-4 text-sm">
              {message}
            </p>
          )}
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
