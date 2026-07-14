import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

export const Route = createFileRoute("/cerez-politikasi")({
  head: () => ({
    meta: [
      { title: "Çerez Politikası | notwork İzmir" },
      {
        name: "description",
        content:
          "notwork web sitesinde kullanılan zorunlu, analitik ve pazarlama çerezleri; Meta Pixel, site içi ölçüm ve tercih yönetimi hakkında bilgi.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Çerez Politikası | notwork" },
      {
        property: "og:description",
        content:
          "notwork.me çerez kullanımı, analiz ve pazarlama ölçümleri ile tercihlerinizi nasıl yöneteceğiniz.",
      },
      { property: "og:url", content: "https://notwork.me/cerez-politikasi" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/cerez-politikasi" }],
  }),
  component: CookiePolicyPage,
});

const cookieTypes = [
  {
    title: "Zorunlu çerezler",
    text: "Siteyi güvenli ve düzgün çalıştırmak, çerez tercihinizi hatırlamak ve temel form akışlarını sürdürebilmek için kullanılır. Bu çerezler kapatılamaz.",
  },
  {
    title: "Analitik çerezler",
    text: "Sayfa görüntüleme, buton tıklama, form gönderimi, kaydırma derinliği ve cihaz tipi gibi ölçümlerle sitenin nasıl kullanıldığını anlamamıza yardımcı olur. Yalnızca onayınızla çalışır.",
  },
  {
    title: "Pazarlama çerezleri",
    text: "Meta Pixel gibi araçlarla etkinlik ve bilet ilgisini ölçmek, reklam performansını anlamak ve daha doğru kampanya optimizasyonu yapmak için kullanılır. Yalnızca onayınızla çalışır.",
  },
  {
    title: "Üçüncü taraf içerikler",
    text: "YouTube videosu, Instagram bağlantıları veya harici bilet/WhatsApp linkleri gibi servisler kendi sayfalarında veya oynatıcılarında ayrı çerezler kullanabilir.",
  },
];

function CookiePolicyPage() {
  const openPreferences = () => {
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary" />
            cookie ayarları
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">
            Çerez Politikası
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            notwork.me’de çerezleri siteyi çalıştırmak, kullanıcı deneyimini iyileştirmek ve onay
            vermeniz halinde analiz/pazarlama ölçümleri yapmak için kullanıyoruz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openPreferences}
              className="rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
            >
              Çerez tercihlerini yönet
            </button>
            <a
              href="mailto:berk@carewithki.com?subject=notwork%20%C3%A7erez%20ve%20KVKK%20talebi"
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              KVKK talebi gönder
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-16">
          <div className="grid gap-4">
            {cookieTypes.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <h2 className="text-xl font-black tracking-tight">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/10 p-6 text-sm leading-relaxed text-foreground/75">
            <h2 className="text-lg font-black text-foreground">Tarayıcı ayarları</h2>
            <p className="mt-2">
              Çerezleri tarayıcı ayarlarınızdan da silebilir veya engelleyebilirsiniz. Bazı
              çerezleri kapatmanız halinde site deneyiminin bir kısmı beklediğiniz gibi
              çalışmayabilir.
            </p>
            <p className="mt-3">
              <strong className="text-foreground">Son güncelleme:</strong> 15 Temmuz 2026.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
