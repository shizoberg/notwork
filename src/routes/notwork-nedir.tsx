import { germanPageText } from "@/lib/german-page-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  Check,
  Clock3,
  HeartHandshake,
  MessageCircle,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { regionalPath, SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/notwork-nedir")({
  head: () =>
    createSeo({
      title: "notwork nedir? | Network Platformu",
      description:
        "notwork; gerçek hikâyeleri, etkinlikleri ve networking teknolojilerini bir araya getirerek doğru insanların tanışmasını sağlayan İzmir merkezli network platformudur.",
      path: "/notwork-nedir",
      keywords: [
        "notwork nedir",
        "network topluluğu",
        "networking platformu",
        "İzmir networking etkinliği",
      ],
    }),
  component: NotworkNedirPage,
});

const journey = [
  {
    number: "01",
    title: "Gerçek bir hikâye",
    text: "Sahnede sonuçtan önce yaşanan denemeleri, hataları ve bunlardan çıkan dersleri dinlersin.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Ortak bir zemin",
    text: "Canlı sorular ve kısa oyunlar salonu izleyici olmaktan çıkarır, konuşmanın parçası yapar.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Doğru karşılaşma",
    text: "notwork match ihtiyaçlarını ve sunabileceklerini okuyarak konuşabileceğin insanları bulur.",
    icon: Network,
  },
  {
    number: "04",
    title: "Devam eden bağlantı",
    text: "Tanıştığın kişiler profilinde kalır. Bir gecelik sohbet, ulaşabileceğin gerçek bir ağa dönüşür.",
    icon: HeartHandshake,
  },
];

const formats = [
  {
    name: "notwork sahne",
    label: "sahne + networking",
    text: "Başarısızlık hikâyelerinden çıkarılmış dersleri dinlediğin ve gecenin sonunda yeni insanlarla tanıştığın ana notwork formatı.",
    icon: CalendarDays,
  },
  {
    name: "notwork fast",
    label: "sohbet + yeni insanlar",
    text: "Daha az sahne, daha fazla sohbet. Rahat bir gecede konuşmayı ve yeni bağlantılar kurmayı kolaylaştırır.",
    icon: MessageCircle,
  },
  {
    name: "notwork match",
    label: "akıllı eşleşme",
    text: "Kim olduğuna, ne aradığına ve ne sunabildiğine göre seni etkinlikte konuşman gereken insanlarla buluşturur.",
    icon: Network,
  },
  {
    name: "ntw.five",
    label: "5 dakikada çözüm",
    text: "İnsanları yetenekten önce problem etrafında toplar. Dört kişilik masalar beş dakikada birlikte çözüm üretir.",
    icon: Clock3,
  },
];

const principles = [
  "Kartvizitten önce gerçek konuşma",
  "Kalabalıktan önce doğru eşleşme",
  "Başarı kadar deneme ve hata",
  "Etkinlikten sonra devam eden bağ",
];

const moments = [
  { src: "/community/25.jpg", alt: "notwork etkinliğinde sohbet eden katılımcılar" },
  { src: "/community/24.jpg", alt: "notwork gecesinde yeni insanlarla tanışan katılımcılar" },
  { src: "/community/23.jpg", alt: "notwork sahnesini izleyen topluluk" },
  { src: "/community/21.jpg", alt: "notwork sahnesindeki konuşmacı" },
];

const whatsappCommunityUrl = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

export function NotworkNedirPage({ german = false }: { german?: boolean } = {}) {
  const t = germanPageText(german);
  return (
    <div className="about-notwork min-h-screen text-foreground">
      <SiteNav german={german} />
      <main>
        <section className="about-hero">
          <div className="about-hero-copy">
            <div className="about-kicker">
              <span aria-hidden="true" /> {t("notwork nedir")}
            </div>
            <h1>
              {t("tanışmayı")}
              <br />
              <em>{t("tesadüfe bırakmayan")}</em>
              <br />
              {t("network platformu")}
            </h1>
            <p>
              {t(
                "notwork gerçek hikâyeleri, fiziksel etkinlikleri ve networking teknolojilerini bir araya getirir. İnsanların yalnızca aynı yerde bulunmasını değil gerçekten tanışmasını sağlar.",
              )}
            </p>
            <div className="about-hero-actions">
              <Link to={regionalPath("/etkinlikler", german)}>
                {t("Etkinlikleri gör")} <ArrowUpRight size={17} />
              </Link>
              <Link
                to={german ? "/de/registrieren" : "/profil"}
                search={german ? {} : { mode: "register" }}
              >
                {t("notwork ol")}
              </Link>
            </div>
          </div>

          <div className="about-system" aria-label={t("notwork sistemi")}>
            <div className="about-system-orbit" aria-hidden="true" />
            <div className="about-system-core">
              <strong>ntw</strong>
              <span>{t("gerçek bağlantılar")}</span>
            </div>
            <article className="about-system-card card-story">
              <Sparkles size={18} />
              <span>{t("gerçek hikâye")}</span>
            </article>
            <article className="about-system-card card-failure">
              <BrainCircuit size={18} />
              <span>{t("başarısızlık hikâyeleri")}</span>
            </article>
            <article className="about-system-card card-match">
              <Network size={18} />
              <span>{t("doğru eşleşme")}</span>
            </article>
            <article className="about-system-card card-community">
              <HeartHandshake size={18} />
              <span>{t("devam eden bağ")}</span>
            </article>
          </div>
        </section>

        <section className="about-definition">
          <span className="about-section-index">01</span>
          <div>
            <p className="about-eyebrow">{t("tek cümlede")}</p>
            <h2>{t("network etkinlikleri ve çözümleri üreten bir network platformu")}</h2>
          </div>
          <p>
            {t(
              "Etkinlik bizim buluşma noktamız. Teknoloji ise o kalabalığın içinde doğru kişiyi bulmayı, konuşmayı başlatmayı ve bağlantıyı etkinlikten sonra sürdürmeyi kolaylaştırır.",
            )}
          </p>
        </section>

        <section className="about-journey">
          <header className="about-section-heading">
            <div>
              <p className="about-eyebrow">{t("bir notwork gecesi")}</p>
              <h2>{t("hikâyeden bağlantıya")}</h2>
            </div>
            <p>{t("İzlemekle başlayıp tanışmakla devam eden basit bir akış")}</p>
          </header>
          <div className="about-journey-grid">
            {journey.map(({ number, title, text, icon: Icon }) => (
              <article key={number}>
                <div className="about-step-top">
                  <span>{number}</span>
                  <Icon size={20} strokeWidth={1.65} />
                </div>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-moments">
          <header className="about-section-heading">
            <div>
              <p className="about-eyebrow">{t("o an orada")}</p>
              <h2>{t("notwork böyle hissettirir")}</h2>
            </div>
            <p>{t("Sahne, masa sohbetleri ve yeni karşılaşmalar aynı gecenin parçaları")}</p>
          </header>
          <div className="about-photo-grid">
            {moments.map((moment, index) => (
              <figure key={moment.src} className={index === 0 ? "is-featured" : ""}>
                <img
                  src={moment.src}
                  alt={german ? "Foto von einem notwork Event" : moment.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <figcaption>{index === 0 ? t("aynı oda") : t("gerçek anlar")}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="about-formats">
          <header className="about-section-heading">
            <div>
              <p className="about-eyebrow">{t("notwork deneyimleri")}</p>
              <h2>{t("her formatın tek bir amacı var")}</h2>
            </div>
            <p>{t("İnsanların konuşmasını kolaylaştırmak ve yeni ihtimaller yaratmak")}</p>
          </header>
          <div className="about-format-grid">
            {formats.map(({ name, label, text, icon: Icon }) => (
              <article key={name}>
                <div className="about-format-icon">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <span>{t(label)}</span>
                <h3>{german && name === "notwork sahne" ? "notwork Bühne" : name}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-belief">
          <div className="about-belief-copy">
            <p className="about-eyebrow">{t("neden varız")}</p>
            <h2>{t("networking bir odadaki insan sayısı değildir")}</h2>
            <p>
              {t(
                "İyi bir network ortamı kendini anlatabildiğin, ihtiyacını söyleyebildiğin ve karşı tarafı gerçekten duyabildiğin yerdir. notwork bütün deneyimi bu açıklık için tasarlar.",
              )}
            </p>
          </div>
          <div className="about-principles">
            {principles.map((principle) => (
              <div key={principle}>
                <Check size={17} strokeWidth={2.2} />
                <span>{t(principle)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-video">
          <div className="about-video-frame">
            <iframe
              src="https://www.youtube.com/embed/vtzncdq4Jlk"
              title={
                german
                  ? "Berk und Armağan erzählen von notwork"
                  : "notwork'ü Berk ve Armağan anlatıyor"
              }
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="about-video-copy">
            <BrainCircuit size={28} strokeWidth={1.5} />
            <p className="about-eyebrow">{t("hikâyenin başı")}</p>
            <h2>{t("notwork’ü kurucularından dinle")}</h2>
            <p>
              {t(
                "Berk ve Armağan notwork’ün neden ortaya çıktığını, sahne ile networking arasındaki bağı ve topluluğun nasıl büyüdüğünü anlatıyor.",
              )}
            </p>
            <a href="https://www.youtube.com/watch?v=vtzncdq4Jlk" target="_blank" rel="noreferrer">
              {t("YouTube’da izle")} <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="about-final">
          <div className="about-final-mark">ntw</div>
          <p className="about-eyebrow">{t("bir sonraki bağlantın burada olabilir")}</p>
          <h2>{t("aynı odada buluşalım")}</h2>
          <div>
            <Link to={regionalPath("/etkinlikler", german)}>
              {t("Yaklaşan etkinlikler")} <ArrowUpRight size={17} />
            </Link>
            <a href={whatsappCommunityUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> {t("WhatsApp topluluğu")}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter german={german} />
    </div>
  );
}
