import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/kvkk")({
  head: () => ({
    meta: [
      { title: "KVKK Aydınlatma Metni | notwork İzmir" },
      {
        name: "description",
        content:
          "notwork İzmir web sitesi, networking formları, etkinlik başvuruları ve topluluk iletişimi için KVKK kapsamındaki kişisel veri işleme bilgilendirmesi.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "KVKK Aydınlatma Metni | notwork" },
      {
        property: "og:description",
        content:
          "notwork tarafından işlenen kişisel veriler, işleme amaçları, aktarım kapsamı ve KVKK haklarınız.",
      },
      { property: "og:url", content: "https://notwork.me/kvkk" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/kvkk" }],
  }),
  component: KvkkPage,
});

const sections = [
  {
    title: "1. Veri sorumlusu ve iletişim",
    body: [
      "notwork, etkinlik, networking ve topluluk deneyimlerini yürütmek amacıyla kişisel verileri işler. KVKK kapsamındaki talepleriniz için berk@carewithki.com adresinden bize ulaşabilirsiniz.",
    ],
  },
  {
    title: "2. İşlediğimiz kişisel veriler",
    body: [
      "Ad soyad, e-posta adresi, Instagram kullanıcı adı, LinkedIn bağlantısı, kullanıcı adı, meslek/rol bilgisi, 140 karakterlik motivasyon metni, etkinlik ve sunum başvuru cevapları işlenebilir.",
      "Etkinlik değerlendirme formunda seçilen etkinlik, 5 yıldız puanı, paylaşılabilir yorum, yüklenen fotoğraf, ekibe özel not ve form onay bilgisi işlenebilir.",
      "Networking formunda verilen onay zamanı, site kullanımı sırasında sayfa görüntüleme, buton tıklama, form gönderimi, kaydırma derinliği, cihaz tipi, kampanya kaynağı ve çerez tercihi gibi teknik ve analitik bilgiler de tutulabilir.",
    ],
  },
  {
    title: "3. İşleme amaçları",
    body: [
      "Kayıtları yönetmek, networking kartlarını ve topluluk ağını göstermek, kullanıcıların kendi bilgilerini güncellemesini sağlamak, etkinlik iletişimi kurmak, etkinlik ve topluluk duyuruları için e-posta göndermek, sunum/sponsor başvurularını değerlendirmek, site güvenliği ve performansını iyileştirmek için veriler işlenir.",
      "Networking ağına kayıt olan kullanıcılar; ad soyad, rol/sıfat, yetenekler, motivasyon metni ve paylaşmayı tercih ettikleri iletişim bağlantılarının topluluk içinde görünür olmasını onaylar.",
      "Etkinlik değerlendirmelerinde verilen paylaşılabilir yorum, puan ve fotoğraflar geçmiş etkinlik kartlarında ve ilgili etkinlik sayfalarında yayınlanabilir. Ekibe özel not alanı yalnızca notwork ekibinin iç değerlendirmesi için kullanılır ve herkese açık alanlarda gösterilmez.",
    ],
  },
  {
    title: "4. Hukuki sebepler",
    body: [
      "Veriler; açık rıza, sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi ve notwork topluluğunun güvenli biçimde işletilmesine yönelik meşru menfaat kapsamında işlenebilir. Networking kartlarının görünmesi, e-posta iletişimi ve etkinlik değerlendirmelerinin yayınlanması için kullanıcıdan form üzerinde açık onay alınır.",
    ],
  },
  {
    title: "5. Aktarım ve kullanılan hizmetler",
    body: [
      "Veriler; barındırma, e-posta, analiz, güvenlik, yedekleme ve etkinlik yönetimi için teknik hizmet sağlayıcılarla sınırlı şekilde paylaşılabilir. Site Netlify/GitHub altyapısı, analiz kayıtları ve Meta Pixel gibi pazarlama/ölçüm araçlarıyla çalışabilir.",
      "Yasal zorunluluk bulunması halinde yetkili kamu kurumlarıyla paylaşım yapılabilir.",
    ],
  },
  {
    title: "6. Saklama süresi",
    body: [
      "Kişisel veriler, topluluk üyeliği ve etkinlik süreçleri için gerekli olduğu sürece saklanır. Silme, düzeltme veya güncelleme talepleriniz geldiğinde makul süre içinde değerlendirilir.",
    ],
  },
  {
    title: "7. KVKK kapsamındaki haklarınız",
    body: [
      "KVKK madde 11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, düzeltme, silme/yok etme, aktarılan üçüncü kişilere bildirim isteme, itiraz etme ve zarar doğması halinde giderim talep etme haklarına sahipsiniz.",
    ],
  },
];

function KvkkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary" />
            kişisel veriler
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">
            KVKK Aydınlatma Metni
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Bu metin, notwork web sitesi ve etkinlik/topluluk süreçlerinde kişisel verilerin nasıl
            işlendiğini sade bir dille açıklar.
          </p>
          <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/10 p-5 text-sm leading-relaxed text-foreground/75">
            <strong className="text-foreground">Son güncelleme:</strong> 15 Temmuz 2026. Bu metin
            genel bilgilendirme amacı taşır; KVKK uyumluluğu için gerekli hallerde hukuk danışmanı
            değerlendirmesi alınması önerilir.
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-16">
          <div className="grid gap-4">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {section.title}
                </h2>
                <div className="mt-3 grid gap-3 text-sm leading-relaxed text-muted-foreground">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
