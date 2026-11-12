import { Link } from "@tanstack/react-router";
import { regionalPath, SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";
import { notworkOrganizationId } from "@/lib/structured-data";

const paths = { tr: "/dokumantasyon", de: "/de/dokumentation" } as const;
const site = "https://notwork.me";

const content = {
  tr: {
    title: "Notwork Nedir? Türkiye’de Networking ve Etkinlik Rehberi | Notwork",
    description:
      "İzmir çıkışlı Notwork networking platformunu keşfet. Türkiye ve Almanya’daki etkinlikler, Notwork Match, Networking topluluğu ve üye profilleri nasıl çalışır?",
    heading: "Notwork nedir, nasıl çalışır?",
    lead: "Notwork, İzmir çıkışlı bir networking platformu ve topluluğudur. Yüz yüze etkinlikleri, etkinlik içi eşleştirme araçlarını ve çevrimiçi üye profillerini bir araya getirir. Türkiye’de ve Almanya’da buluşmalar düzenler.",
    contents: "Bu rehberde",
    sections: [
      {
        id: "etkinlikler",
        title: "1. Etkinliği ve formatı seç",
        paragraphs: [
          "Notwork Sahne’de konuşmacılar başarısızlık hikâyelerini ve çıkardıkları dersleri paylaşır. Notwork Fast, kısa tanışmalar ve daha fazla sohbet için tasarlanmış bir etkinlik formatıdır. Her etkinliğin programı, konumu ve bilet durumu kendi sayfasında yer alır.",
        ],
        link: ["/etkinlikler", "Etkinlik takvimine bak"],
      },
      {
        id: "katilim",
        title: "2. Etkinlik kaydını tamamla",
        paragraphs: [
          "Etkinlik ekibinin paylaştığı bağlantı, QR veya giriş koduyla ilgili etkinliğe gir. Profilin varsa giriş yap. Etkinlik sorularında kendini, ne aradığını ve başkalarına nasıl katkı sunabileceğini anlat.",
        ],
        link: ["/ntw", "Etkinlik ekranını ve Match demosunu gör"],
      },
      {
        id: "match",
        title: "3. Notwork Match ile grubunu bul",
        paragraphs: [
          "Match, katılımcıların ilgi alanları, ihtiyaçları ve sunabilecekleri katkılar üzerinden küçük gruplar kurar. Etkinlik ekibi eşleştirmeyi açtığında grubunun adını, üyelerini ve buluşmayı kolaylaştıran grup sohbetini görürsün. Grup ekranındaki tanışma soruları ilk konuşmaya yardımcı olur.",
          "WordCloud, katılımcıların bir soruya verdiği ortak yanıtları sahnede gösterir. Programda NTW Five varsa küçük gruplar bir katılımcının problemine kısa sürede çözüm fikirleri üretir. Hangi araçların açılacağını etkinliğin programı belirler.",
        ],
      },
      {
        id: "topluluk",
        title: "4. Etkinlikten sonra toplulukta bağlantıda kal",
        paragraphs: [
          "Networking dizininde isim, uzmanlık ve ilgi alanına göre üye kartlarını arayabilirsin. Doğrulanmış üyeler, üyelerin paylaşmayı seçtiği iletişim yollarını görebilir. Üye profili etkinlik geçmişini, bağlantıları, yetenekleri ve deneyimleri bir araya getirir. Herkese açık hale getirdiğin ntw.business kartını bir bağlantı veya QR kodla paylaşabilirsin.",
        ],
        link: ["/networking", "Networking topluluğunu keşfet"],
      },
      {
        id: "sorular",
        title: "Sık sorulan sorular",
        faq: [
          [
            "Notwork bir etkinlik mi, uygulama mı?",
            "Notwork hem yüz yüze etkinlikler düzenleyen bir topluluk hem de bu etkinliklerde ve sonrasında networking’i destekleyen bir platformdur.",
          ],
          [
            "Türkiye’de Notwork etkinliklerini nereden bulurum?",
            "İzmir’deki ve Türkiye’deki güncel Notwork buluşmaları Türkçe etkinlik takviminde yer alır. Almanya’daki buluşmalar Almanca takvimde yayımlanır.",
          ],
          [
            "Etkinliğe gelmeden Match’i deneyebilir miyim?",
            "Etkinlik ekranındaki etkileşimli Match demosunu örnek bir grupla kullanabilirsin. Demo işlemleri canlı etkinlik kayıtlarına eklenmez.",
          ],
        ],
      },
    ],
  },
  de: {
    title: "Was ist notwork? Leitfaden für Networking und Events | Notwork",
    description:
      "So funktioniert notwork, die Networking-Plattform aus İzmir. Lerne die Events in der Türkei und Deutschland, notwork Match, die Community und Mitgliedsprofile kennen.",
    heading: "Was ist notwork und wie funktioniert es?",
    lead: "notwork ist eine Networking-Plattform und Community aus İzmir. Sie verbindet persönliche Veranstaltungen, Matching während des Events und Online-Mitgliedsprofile. notwork veranstaltet Treffen in der Türkei und in Deutschland.",
    contents: "In diesem Leitfaden",
    sections: [
      {
        id: "etkinlikler",
        title: "1. Event und Format auswählen",
        paragraphs: [
          "Bei notwork Bühne erzählen Menschen von Rückschlägen und davon, was sie daraus gelernt haben. notwork Fast bietet kurze Begegnungen und mehr Zeit für Gespräche. Programm, Veranstaltungsort und Ticketstatus stehen auf der jeweiligen Eventseite.",
        ],
        link: ["/etkinlikler", "Zum Eventkalender"],
      },
      {
        id: "katilim",
        title: "2. Für das Event anmelden",
        paragraphs: [
          "Öffne das Event über den Link, QR-Code oder Zugangscode des Eventteams. Melde dich an, wenn du bereits ein Profil hast. Erzähle in den Eventfragen, wer du bist, was du suchst und wie du andere unterstützen kannst.",
        ],
        link: ["/ntw", "Eventansicht und Match-Demo öffnen"],
      },
      {
        id: "match",
        title: "3. Mit notwork Match deine Gruppe finden",
        paragraphs: [
          "Match bildet kleine Gruppen anhand der Interessen, Bedürfnisse und Stärken der Teilnehmenden. Sobald das Eventteam das Matching startet, siehst du den Gruppennamen, die Mitglieder und den Gruppenchat, in dem ihr einen Treffpunkt vereinbaren könnt. Gesprächsimpulse helfen beim Einstieg.",
          "WordCloud zeigt gemeinsame Antworten auf eine Frage auf der Bühne. Wenn NTW Five auf dem Programm steht, entwickelt eine kleine Gruppe in kurzer Zeit Lösungsideen für das Problem einer teilnehmenden Person. Welche Tools verfügbar sind, hängt vom Eventprogramm ab.",
        ],
      },
      {
        id: "topluluk",
        title: "4. Nach dem Event in Kontakt bleiben",
        paragraphs: [
          "Im Networking-Verzeichnis kannst du Mitgliedskarten nach Name, Fachgebiet oder Interesse suchen. Verifizierte Mitglieder sehen freigegebene Kontaktmöglichkeiten. Dein Profil bündelt besuchte Events, Kontakte, Fähigkeiten und Erfahrungen. Eine öffentliche ntw.business-Karte kannst du per Link oder QR-Code teilen.",
        ],
        link: ["/networking", "Networking-Community entdecken"],
      },
      {
        id: "sorular",
        title: "Häufig gestellte Fragen",
        faq: [
          [
            "Ist notwork ein Event oder eine App?",
            "notwork ist eine Community mit persönlichen Veranstaltungen und eine Plattform für Networking während und nach diesen Events.",
          ],
          [
            "Wo finde ich die nächsten Events?",
            "Treffen in Deutschland stehen im deutschsprachigen Eventkalender. Events in İzmir und in der Türkei findest du im türkischsprachigen Kalender.",
          ],
          [
            "Kann ich Match vor dem Event ausprobieren?",
            "In der interaktiven Match-Demo kannst du den Ablauf mit einer Beispielgruppe ausprobieren. Die Demo speichert keine Änderungen in den Live-Eventdaten.",
          ],
        ],
      },
    ],
  },
} as const;

export function documentationHead(german = false) {
  const language = german ? "de" : "tr";
  const copy = content[language];
  const canonical = site + paths[language];
  const seo = createSeo({
    title: copy.title,
    description: copy.description,
    path: paths[language],
    locale: german ? "de_DE" : "tr_TR",
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical,
      name: copy.heading,
      description: copy.description,
      url: canonical,
      inLanguage: language,
      about: { "@id": notworkOrganizationId },
      publisher: { "@id": notworkOrganizationId },
    },
  });
  return {
    ...seo,
    links: [
      ...seo.links,
      { rel: "alternate", hrefLang: "tr", href: site + paths.tr },
      { rel: "alternate", hrefLang: "de", href: site + paths.de },
      { rel: "alternate", hrefLang: "x-default", href: site + paths.tr },
    ],
  };
}

export function NotworkDocumentation({ german = false }: { german?: boolean } = {}) {
  const copy = content[german ? "de" : "tr"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav german={german} />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:py-16">
        <article>
          <header className="border-b border-border pb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              {german ? "notwork Dokumentation" : "notwork dokümantasyon"}
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-black tracking-tight sm:text-6xl">
              {copy.heading}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {copy.lead}
            </p>
          </header>
          <nav
            aria-label={copy.contents}
            className="my-8 rounded-3xl border border-border bg-card p-5 sm:p-7"
          >
            <h2 className="font-bold">{copy.contents}</h2>
            <ul className="mt-3 space-y-2">
              {copy.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-primary-deep underline underline-offset-4"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {copy.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-b border-border py-8"
            >
              <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                {section.title}
              </h2>
              {"paragraphs" in section &&
                section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              {"link" in section && (
                <Link
                  className="mt-4 inline-block font-bold text-primary-deep underline underline-offset-4"
                  to={regionalPath(section.link[0], german)}
                >
                  {section.link[1]}
                </Link>
              )}
              {"faq" in section &&
                section.faq.map(([question, answer]) => (
                  <div key={question} className="mt-5">
                    <h3 className="font-bold">{question}</h3>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{answer}</p>
                  </div>
                ))}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter german={german} />
    </div>
  );
}
