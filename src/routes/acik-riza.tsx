import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, Mail, Network, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/acik-riza")({
  head: () =>
    createSeo({
      title: "Açık Rıza Metni | notwork",
      description:
        "notwork profil görünürlüğü, networking eşleştirmesi, etkinlik içeriği ve iletişim tercihleri için açık rıza seçenekleri.",
      path: "/acik-riza",
      keywords: ["notwork açık rıza", "notwork profil görünürlüğü"],
    }),
  component: ExplicitConsentPage,
});

const choices = [
  {
    icon: Network,
    title: "Networking ve etkinlik ürünleri",
    text: "Profil cevaplarımın, katkı/ihtiyaç alanlarımın ve etkinlik kodumun bağlantı önerileri, MatchLab grupları, ntw.five görüşmeleri ve etkinlik içi topluluk deneyimi için kullanılmasına rıza gösterebilirim.",
  },
  {
    icon: Eye,
    title: "Profil ve içerik görünürlüğü",
    text: "Seçtiğim profil bilgilerinin, business kartımın, referanslarımın, yorumumun, puanımın ve yüklediğim görselin ilgili notwork alanlarında yayınlanmasına ayrı olarak rıza gösterebilirim.",
  },
  {
    icon: Mail,
    title: "Etkinlik ve topluluk duyuruları",
    text: "Yeni etkinlik, bilet, topluluk ve ürün duyurularının e-posta yoluyla gönderilmesine isteğe bağlı olarak izin verebilirim. Bu tercih, üyeliğin zorunlu şartı değildir.",
  },
];

function ExplicitConsentPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-4xl px-5 pb-8 pt-10 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-primary-deep">
            <ShieldCheck className="h-4 w-4" />
            tercihlerin sende
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">
            Açık Rıza Metni
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Bu metin, hangi isteğe bağlı işlemler için rıza verebileceğini açıklar.{" "}
            <Link to="/kvkk" className="font-black text-primary-deep underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            ise verilerin nasıl işlendiğine dair bilgilendirmedir; iki metin birbirinden ayrıdır.
          </p>
          <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/10 p-5 text-sm leading-6 text-foreground/70">
            <strong className="text-foreground">Son güncelleme:</strong> 27 Ağustos 2026. Rıza;
            belirli bir işlem için, bilgilendirmeye dayalı ve özgür iradeyle verilir.
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-16">
          <div className="grid gap-4">
            {choices.map((choice) => {
              const Icon = choice.icon;
              return (
                <article
                  key={choice.title}
                  className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">{choice.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{choice.text}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary-deep" />
              <div>
                <h2 className="text-xl font-black tracking-tight">Rızanı geri çekebilirsin</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Verdiğin açık rızayı geleceğe etkili olacak şekilde her zaman geri çekebilirsin.
                  Profil görünürlüğü, yayınlanan içerik veya iletişim tercihleri için{" "}
                  <a
                    className="font-black text-primary-deep underline"
                    href="mailto:berk@carewithki.com?subject=notwork%20a%C3%A7%C4%B1k%20r%C4%B1za%20tercihi"
                  >
                    berk@carewithki.com
                  </a>{" "}
                  adresine yazabilirsin. Geri çekme öncesindeki hukuka uygun işlemler bundan
                  etkilenmez.
                </p>
              </div>
            </div>
          </article>

          <p className="mt-5 rounded-3xl border border-primary/20 bg-primary/10 p-5 text-sm leading-7 text-foreground/65">
            Bir formda yalnızca seçtiğin amaca yönelik açık rıza alınır. Pazarlama/duyuru izni ayrı
            ve isteğe bağlıdır. Zorunlu üyelik veya etkinlik işlemleri, uygun başka bir hukuki
            sebebe dayanıyorsa açık rıza şartına bağlanmaz.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
