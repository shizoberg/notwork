import { Link, createFileRoute } from "@tanstack/react-router";
import { Database, Eye, Network, ShieldCheck, UserRound } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/kvkk")({
  head: () =>
    createSeo({
      title: "KVKK Aydınlatma Metni | notwork",
      description:
        "notwork profili, etkinlik kaydı, networking ağı, ntw.match.lab, ntw.five ve ntw.wordcloud süreçlerinde kişisel verilerin nasıl işlendiğini inceleyin.",
      path: "/kvkk",
      keywords: ["notwork KVKK", "networking veri politikası", "notwork profil gizlilik"],
    }),
  component: KvkkPage,
});

const dataGroups = [
  {
    icon: UserRound,
    title: "Kimlik ve iletişim",
    text: "Ad soyad, kullanıcı adı, e-posta, telefon, Instagram ve LinkedIn bağlantıları.",
  },
  {
    icon: Network,
    title: "Profil ve networking",
    text: "Profil fotoğrafı, meslek/rol, şirket ve staj geçmişi, yetenekler, katkılar, ihtiyaçlar, biyografi, referanslar, bağlantılar, etkinlik katılımı, NTW kodu ve business kart bilgileri.",
  },
  {
    icon: Database,
    title: "Etkinlik ürünleri",
    text: "QR kaydı, etkinliğe özel yanıtlar, WordCloud cevapları, MatchLab grup ve durum kayıtları, ntw.five problem/çözüm talepleri, görüşme mesajları, puan, yorum, fotoğraf ve ekibe özel notlar.",
  },
  {
    icon: Eye,
    title: "Teknik ve kullanım",
    text: "Oturum bilgisi, işlem zamanı, cihaz/tarayıcı türü, sayfa görüntüleme, tıklama, form gönderimi, kaydırma, yönlendiren kaynak ve çerez tercihi.",
  },
];

const sections = [
  {
    id: "sorumlu",
    title: "1. Veri sorumlusu ve iletişim",
    body: [
      "Veri sorumlusu, notwork topluluk organizasyonudur. İletişim ve KVKK başvuruları için berk@carewithki.com adresini kullanabilirsiniz.",
      "İletişim adresi: Çınarlı, 1572/1. Sk. No:33, 35170 Konak/İzmir.",
    ],
  },
  {
    id: "toplama",
    title: "2. Verileri nasıl topluyoruz?",
    body: [
      "Veriler; notwork.me formları, etkinlik alanındaki QR akışları, profil ve business kart işlemleri, etkinlik değerlendirmeleri, topluluk başvuruları, destek talepleri, çerezler ve site kullanım kayıtları üzerinden elektronik ortamda toplanır.",
      "Bir notwork üyesinin başka bir üyeye yazdığı referans veya etkinlik ekibinin doğrulama/onay kayıtları da ilgili profil ile ilişkilendirilebilir.",
    ],
  },
  {
    id: "amac",
    title: "3. İşleme amaçları",
    body: [
      "Üyelik ve giriş işlemlerini yürütmek; etkinlik katılımını doğrulamak; profilleri, business kartları ve QR kodlarını oluşturmak; kişilerin kendi verilerini güncellemesini sağlamak; networking ağını göstermek ve topluluk güvenliğini korumak.",
      "ntw.match.lab ile kişilerin katkı, ihtiyaç ve niyetlerine göre bağlantı önerileri oluşturmak; ntw.five içinde problem, çözüm talebi, görüşme ve zaman akışını yürütmek; ntw.wordcloud sonuçlarını etkinlik sırasında toplu veya anonim biçimde göstermek.",
      "Başvuru, sunum, startup ve sponsorluk taleplerini değerlendirmek; etkinlik geri bildirimlerini analiz etmek; açık rıza verilen yorum ve görselleri notwork sayfalarında yayınlamak; site güvenliği, hata tespiti, performans ve istatistik çalışmalarını yürütmek.",
    ],
  },
  {
    id: "hukuk",
    title: "4. Hukuki sebepler",
    body: [
      "Kişisel veriler, KVKK madde 5 kapsamında bir sözleşmenin kurulması veya ifası, hukuki yükümlülük, bir hakkın tesisi/kullanılması, veri sorumlusunun meşru menfaati ve gerektiğinde açık rıza hukuki sebeplerine dayanılarak işlenir.",
      "Aydınlatma metni bilgi verme amacı taşır ve onaya bağlı değildir. Profilin herkese açık gösterilmesi, fotoğraf/yorum yayınlanması veya etkinlik dışı tanıtım iletişimi gibi açık rıza gerektiren işlemler için form üzerinde ayrı seçim sunulur. Ticari elektronik ileti izni ayrıca ve isteğe bağlı alınır.",
    ],
  },
  {
    id: "gorunurluk",
    title: "5. Görünürlük, eşleştirme ve referanslar",
    body: [
      "Ad, profil fotoğrafı, rol, yetenek ve kısa profil bilgileri tercih edilen görünürlük ayarına göre networking ağında veya business kartta gösterilebilir. E-posta ve telefon gibi doğrudan iletişim bilgileri yalnızca kullanıcının seçimi ve ürün erişim kuralları çerçevesinde görüntülenir.",
      "MatchLab ve bağlantı önerileri, form cevapları ile profil etiketlerini karşılaştıran kurallı/otomatik sistemlerden yararlanabilir. Bu sistemler kişi hakkında hukuki sonuç doğuran veya benzer ölçüde önemli, yalnızca otomatik bir karar vermez; öneriler etkinlik deneyimini kolaylaştırmak içindir.",
      "Referanslar yalnızca doğrulanmış notwork üyelerince yazılabilir; profil sahibi ve notwork ekibi uygunsuz içerikleri bildirebilir, gizleyebilir veya kaldırılmasını isteyebilir.",
    ],
  },
  {
    id: "aktarim",
    title: "6. Aktarım ve hizmet sağlayıcılar",
    body: [
      "Veriler; barındırma ve veri saklama için Netlify/Netlify Blobs, kod ve dağıtım altyapısı için GitHub, e-posta bildirimleri için Resend ve güvenlik/yedekleme hizmeti veren teknik sağlayıcılarla amaçla sınırlı olarak paylaşılabilir.",
      "Analitik veya pazarlama çerezlerine izin verilirse Meta Pixel gibi ölçüm araçları çalışabilir. YouTube, Instagram, LinkedIn, WhatsApp ve harici bilet bağlantıları açıldığında ilgili platformların kendi gizlilik koşulları uygulanır.",
      "Yurt dışındaki bir hizmet sağlayıcının kullanıldığı hallerde aktarım, KVKK madde 9 ve yürürlükteki uygun güvence mekanizmalarına göre yürütülür. Kanuni zorunluluk halinde yetkili kurumlarla paylaşım yapılabilir.",
    ],
  },
  {
    id: "saklama",
    title: "7. Saklama ve silme",
    body: [
      "Veriler, ilgili üyelik veya etkinlik süreci ve işleme amacı devam ettiği sürece; sonrasında ise yasal yükümlülükler, uyuşmazlık süreleri ve güvenli yedekleme gereksinimleriyle sınırlı olarak saklanır. Pazarlama izni geri çekildiğinde iletişim listesi kullanımı durdurulur.",
      "İşleme sebebi ortadan kalktığında veriler periyodik kontrollerle veya talep üzerine silinir, yok edilir ya da anonim hale getirilir. Yayındaki profil, business kart, referans, yorum ve fotoğraflar için gizleme, düzeltme veya kaldırma talebi iletebilirsiniz.",
    ],
  },
  {
    id: "guvenlik",
    title: "8. Güvenlik",
    body: [
      "Yetkilendirme, oturum kontrolü, sınırlı admin erişimi, yedekleme ve kayıt takibi gibi teknik/idari tedbirler uygulanır. Şifreler açık metin olarak yayınlanmaz; hesap bilgilerinizi başkalarıyla paylaşmamanız gerekir.",
    ],
  },
  {
    id: "haklar",
    title: "9. Haklarınız ve başvuru",
    body: [
      "KVKK madde 11 kapsamında verilerinizin işlenip işlenmediğini öğrenme, bilgi ve aktarım yapılan tarafları isteme, amacına uygun kullanımı öğrenme, eksik/yanlış veriyi düzeltme, şartları varsa silme veya yok etme, bu işlemlerin üçüncü kişilere bildirilmesini isteme, yalnızca otomatik analiz sonucu aleyhinize çıkan sonuca itiraz etme ve zarar halinde giderim talep etme haklarına sahipsiniz.",
      "Talebinizi kimliğinizi doğrulamaya elverişli bilgilerle berk@carewithki.com adresine iletebilirsiniz. Başvurular, niteliğine göre en kısa sürede ve en geç 30 gün içinde sonuçlandırılır.",
    ],
  },
];

function KvkkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-8 pt-10 sm:pb-10 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-primary-deep">
            <ShieldCheck className="h-4 w-4" />
            gizlilik merkezi
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.52fr] lg:items-end">
            <div>
              <h1 className="font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl">
                KVKK Aydınlatma Metni
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Profilinden etkinlik ürünlerine kadar hangi veriyi, neden kullandığımızı ve kontrol
                seçeneklerini sade biçimde açıklar.
              </p>
            </div>
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 text-sm leading-6">
              <p className="font-black">Son güncelleme · 27 Ağustos 2026</p>
              <p className="mt-2 text-foreground/60">
                Aydınlatma ve açık rıza birbirinden ayrıdır. Rıza gerektiren tercihler için{" "}
                <Link to="/acik-riza" className="font-black text-primary-deep underline">
                  Açık Rıza Metni
                </Link>
                ’ni inceleyin.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {dataGroups.map((group) => {
              const Icon = group.icon;
              return (
                <article
                  key={group.title}
                  className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-black tracking-tight">{group.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.text}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16">
          <div className="grid gap-4">
            {sections.map((section) => (
              <article
                id={section.id}
                key={section.id}
                className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7"
              >
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">{section.title}</h2>
                <div className="mt-3 grid gap-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 rounded-3xl border border-primary/20 bg-primary/10 p-5 sm:p-6">
            <a
              href="mailto:berk@carewithki.com?subject=notwork%20KVKK%20ba%C5%9Fvurusu"
              className="rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
            >
              KVKK başvurusu gönder
            </a>
            <Link
              to="/acik-riza"
              className="rounded-full border border-primary/25 bg-background px-5 py-3 text-sm font-black"
            >
              Açık rıza metni
            </Link>
            <Link
              to="/cerez-politikasi"
              className="rounded-full border border-primary/25 bg-background px-5 py-3 text-sm font-black"
            >
              Çerez tercihleri
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
