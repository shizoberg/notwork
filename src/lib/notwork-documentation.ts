export type DocumentationSection = {
  id: string;
  title: string;
  summary?: string;
  entries?: readonly (readonly [label: string, description: string])[];
  link?: readonly [path: string, label: string];
  faq?: readonly (readonly [question: string, answer: string])[];
};

type Documentation = {
  title: string;
  description: string;
  heading: string;
  lead: string;
  contents: string;
  journeyLabel: string;
  journey: readonly string[];
  sections: readonly DocumentationSection[];
};

export const documentation: Record<"tr" | "de", Documentation> = {
  tr: {
    title: "Notwork Teknik Dokümantasyonu | Networking, Match ve Etkinlikler",
    description:
      "Notwork’ün teknik rehberi. Türkiye’de networking etkinliğine katılım, Match eşleştirme mantığı, grup sohbeti, NTW Five, WordCloud, üye profilleri ve etkinlik yönetimi.",
    heading: "Notwork teknik dokümantasyonu",
    lead: "Notwork, İzmir çıkışlı bir networking platformu ve topluluğudur. Etkinlik kaydını, yüz yüze tanışmayı, grup araçlarını ve etkinlik sonrası bağlantıları tek akışta birleştirir. Bu rehber, katılımcının gördüğü ekranları ve bu ekranların arkasındaki işleyişi anlatır.",
    contents: "İçindekiler",
    journeyLabel: "Katılımcı akışı",
    journey: [
      "Etkinliği seç",
      "Kayıt ol veya giriş yap",
      "Grubunu bul",
      "Tanış ve katkı ver",
      "Bağlantıda kal",
    ],
    sections: [
      {
        id: "etkinlikler",
        title: "Platform ve etkinlik formatları",
        summary:
          "Notwork yüz yüze etkinlikler düzenler ve etkinlik içinde kullanılan dijital networking araçları geliştirir. Türkiye ve Almanya için ayrı etkinlik takvimleri vardır. Etkinlik sayfası tarih, konum, program ve bilet durumunu gösterir.",
        entries: [
          [
            "Notwork Sahne",
            "Konuşmacılar başarısızlık hikâyelerini ve öğrendiklerini paylaşır. Programa göre sahne bölümlerine WordCloud ve Notwork Match eşlik eder.",
          ],
          [
            "Notwork Fast",
            "Daha kısa tanışmalar ve daha çok sohbet için tasarlanmış format. Match, Five ve serbest networking etkinliğin programına göre kullanılabilir.",
          ],
        ],
        link: ["/etkinlikler", "Etkinlik takvimini aç"],
      },
      {
        id: "katilim",
        title: "Etkinliğe giriş, profil ve oturum",
        summary:
          "Üye hesabı kalıcı profilini taşır. Etkinlik kaydı ise belirli bir etkinliğe ait katılımı, verdiğin yanıtları ve o etkinlikteki uygulama oturumunu temsil eder.",
        entries: [
          [
            "Giriş",
            "Organizatörün paylaştığı bağlantı, QR veya giriş kodu etkinlik ekranına götürür. Kayıtlı üye mevcut hesabıyla giriş yapabilir. Yeni katılımcı ekrandaki kayıt adımlarını tamamlar.",
          ],
          [
            "Etkinliğe özel yanıtlar",
            "Kendini tanıt, aradığın bağlantıyı ve gruba ne katabileceğini anlat. Organizatör soruları etkinliğe göre düzenleyebilir.",
          ],
          [
            "Kaldığın yerden devam",
            "Sistem mevcut etkinlik kaydını ve varsa açık grubu geri yüklemeye çalışır. Match ekranından etkinlik menüsüne dönmek tek başına grubu kapatmaz.",
          ],
          [
            "Uygulama sırası",
            "Katılımcıya gösterilen araçlar ve sıraları etkinlik ayarlarından gelir. Sahne, anket veya Five her etkinlikte aynı programla çalışmayabilir.",
          ],
        ],
        link: ["/ntw", "Etkinlik ekranını ve Match demosunu aç"],
      },
      {
        id: "match",
        title: "Notwork Match eşleştirme mantığı",
        summary:
          "Match, uygun katılımcılar arasından üç kişilik gruplar kurar. Hesaplama etkinliğin kendi katılımcı havuzunda çalışır.",
        entries: [
          [
            "1. Uygun havuz",
            "Organizatör eşleştirmeyi başlattığında uygun ve müsait katılımcılar değerlendirilir. Açık grubu olan katılımcının mevcut grubu geri döner. Yeterli kişi yoksa bekleme durumu gösterilir.",
          ],
          [
            "2. İhtiyaç ve katkı",
            "Sistem, aradığın şeyin adayın sunabildikleriyle ve adayın ihtiyacının senin katkınla ne kadar örtüştüğünü iki yönde değerlendirir. Ortak kavramlar ek sinyal olarak kullanılır.",
          ],
          [
            "3. Üçlü uyum",
            "Adayların birbiriyle uyumu ve katkılarının çeşitliliği de değerlendirilir. Daha önce tanışılmamış adaylara öncelik verilir. Havuz darsa geçmişte eşleşilmiş kişiler tekrar çıkabilir.",
          ],
          [
            "4. Grup kaydı",
            "Grup ve katılımcı üyelikleri birlikte kaydedilir. Eşzamanlı istekler ve tekrar denemeler, bir katılımcının aynı anda iki gruba atanmasını önleyecek şekilde ele alınır.",
          ],
        ],
      },
      {
        id: "ai",
        title: "NTW AI ve kural tabanlı devam",
        entries: [
          [
            "Aday sıralaması",
            "Uygun koşullarda AI, kurallarla oluşturulan kısa aday listesini yeniden sıralamaya yardımcı olabilir. Önce etkinlik ve müsaitlik koşulları uygulanır.",
          ],
          [
            "Eşleşme analizi",
            "Grup ekranında olası bir ortak çalışma veya konuşma konusu tek bir kısa öneriyle açıklanabilir. Bu metin katılımcıların beyan ettiği ihtiyaç ve katkılara dayanır.",
          ],
          [
            "Servis kullanılamadığında",
            "Zaman aşımı, kullanım sınırı ya da geçersiz yanıt durumunda kural tabanlı sıralama ve açıklama kullanılabilir. AI metni eşleşmenin açılması için zorunlu değildir.",
          ],
        ],
      },
      {
        id: "grup",
        title: "Grup ekranı, sohbet ve yeni tur",
        entries: [
          [
            "Buluşma",
            "Grup adı, üye isimleri ve kişisel kodlar kalabalıkta birbirinizi bulmanıza yardım eder. Grup adı tam ekranda gösterilebilir. Tanışma soruları ilk konuşma için öneri sunar.",
          ],
          [
            "Grup sohbeti",
            "Sohbet okuma ve yazma işlemleri etkinlik oturumuna ve aktif grup üyeliğine bağlıdır. Mesajlar grubun buluşma noktasını belirlemesi için kullanılabilir.",
          ],
          [
            "Yeni eşleşme",
            "Katılımcılar yeni tur isteyebilir. Grup üyelerinin onayları tamamlanınca grup kapanır ve uygun kişiler tekrar havuza döner. Yeni grup için yeterli katılımcı yoksa ekran beklemeye döner.",
          ],
          [
            "Fotoğraf ve değerlendirme",
            "Grup için bir fotoğrafçı belirlenebilir. Etkinlik fotoğrafı, yorum ve puan akışı, ilgili etkinliğin değerlendirmesiyle ilişkilendirilir. Yayın için ayrıca açık rıza istenir.",
          ],
        ],
      },
      {
        id: "five",
        title: "NTW Five problem masaları",
        summary:
          "Five, belirli bir problemi küçük grupta tartışmak için tasarlanmıştır. Katılımcı bir problem yazabilir veya çözüm üretmek için açık bir masaya katılabilir.",
        entries: [
          [
            "Masa ve grup kodu",
            "Bir problem etrafında dört kişilik masa oluşturulur. Grup kodu, sohbet ve görüşme ekranı o masaya aittir.",
          ],
          [
            "Beş dakikalık tur",
            "Tur başlatıldığında sayaç çalışır. Grup problem üzerinde konuşur, çözüm önerisini yazar ve sonucu değerlendirir.",
          ],
          [
            "Tur sonrası",
            "Masa akışında görevlendirilen kişi tur bitince fotoğraf ekleyebilir. Katılımcılar çözüm ve puan kaydından sonra masadan ayrılıp başka bir probleme geçebilir.",
          ],
        ],
      },
      {
        id: "sahne-araclari",
        title: "WordCloud, canlı oylama ve anket",
        entries: [
          [
            "WordCloud",
            "Organizatör bir soru açar. Katılımcı yanıtları soru bazında toplanır. Benzer yazımların bir araya gelmesi için metin normalize edilir. Sahne görünümü yanıtların dağılımını gösterir.",
          ],
          [
            "Canlı oylama",
            "Launchspace gibi etkinliklerde soru ve seçenekler organizatör tarafından düzenlenebilir. Katılımcı oyunu telefondan verir. Sahne görünümünde seçeneklerin oy dağılımı çubuklarla gösterilir.",
          ],
          [
            "Etkinlik sonrası anket",
            "Etkinlik deneyimi, kurulan bağlantılar ve etkinlikten sonra yeniden görüşme gibi konular hakkında geri bildirim toplanabilir. Sonuçlar organizatörün incelemesi için panelde yer alır.",
          ],
        ],
      },
      {
        id: "topluluk",
        title: "Networking dizini ve ntw.business",
        entries: [
          [
            "Keşif",
            "Networking dizininde isim, rol ve yetenekle arama yapılabilir. Kartlar topluluk profillerini ve doğrulanmış üyeleri ayırt eder. Türkçe ve Almanca sürümler aynı dizin tasarımını kullanır.",
          ],
          [
            "İletişim ve referans",
            "Doğrulanmış üyeler, üyelerin görünür kıldığı iletişim yollarına erişebilir. Açık üye kartlarına doğrulanmış üyeler referans yazabilir. Referanslar incelemeden sonra yayımlanır.",
          ],
          [
            "Kalıcı profil",
            "Üye hesabında fotoğraf, biyografi, yetenekler, deneyimler, bağlantılar ve katıldığın etkinlikler yer alabilir. Görünür hale getirdiğin ntw.business kartı bağlantı veya QR kodla paylaşılabilir.",
          ],
        ],
        link: ["/networking", "Networking dizinini aç"],
      },
      {
        id: "veri",
        title: "Veri modeli ve görünürlük",
        entries: [
          [
            "Üye → etkinlik katılımı",
            "Aynı üye hesabıyla birden fazla etkinliğe katılabilirsin. Etkinliğe özel yanıtlar, kişisel kod ve aktif eşleşme ilgili katılımla ilişkilendirilir.",
          ],
          [
            "Etkinlik → ürün → veri seti",
            "Match grupları, WordCloud cevapları, Five masaları ve oylamalar kendi ürün bağlamında tutulur. Desteklenen etkinliklerde demo ve canlı kayıtlar farklı veri setlerine ayrılabilir.",
          ],
          [
            "Özel ve açık yüzeyler",
            "Etkinlik yanıtları, grup sohbeti, herkese açık üye kartı ve yayımlanmış etkinlik yorumu farklı görünürlük kurallarına sahiptir. Duyuru e-postası tercihi ayrı alınır.",
          ],
        ],
        link: ["/kvkk", "Gizlilik ve kişisel veri açıklamasını aç"],
      },
      {
        id: "yonetim",
        title: "Organizatör akışı ve sahne yönetimi",
        entries: [
          [
            "Kurulum",
            "Etkinlik kaydında tarih, konum, kayıt soruları ve programda kullanılacak araçlar ayarlanır. Organizatör araçların görünürlüğünü ve sırasını belirler.",
          ],
          [
            "Prova",
            "Etkinlik girişini, eşleşmeyi, sahne görünümünü ve oylamayı demo verisiyle prova et. Test sırasında kullanılan veri setini kontrol et.",
          ],
          [
            "Canlı kullanım",
            "Katılımcılar etkinlik ekranından kaydolur. Organizatör eşleştirmeyi başlatır ve programa göre WordCloud sorusu, oylama veya duyuru açar. Sahne ekranı katılımcı ekranından ayrı kullanılabilir.",
          ],
          [
            "Etkinlik sonrası",
            "Yetkili ekip etkinlik kayıtlarını, eşleşme ve araç kullanımını, anket yanıtlarını ve değerlendirmeleri inceler. Katılımcı deneyimi için kayıt sayısı, oturum sayısı ve grup sayısı ayrı ölçülür.",
          ],
        ],
      },
      {
        id: "mimari",
        title: "Web mimarisi ve test yüzeyleri",
        entries: [
          [
            "Web uygulaması",
            "Notwork.me arayüzü React ve TypeScript ile geliştirilir. TanStack Router sayfaları yönetir. Etkinlik takvimi, rehber ve diğer açık sayfalar sunucuda oluşturulan HTML ile de okunabilir.",
          ],
          [
            "Etkinlik servisleri",
            "Katılım, eşleşme, WordCloud ve Five gibi işlemler sunucu tarafında yürütülür. Etkinlik ürünlerinin bir kısmı yapılandırılmış kayıtlarını Netlify Blobs üzerinde tutar. Katılımcı ekranı oturumuna ve gruba ait durumu sunucudan alır.",
          ],
          [
            "Match demosu",
            "Demo, kayıt, bekleme, grup ekranı, sohbet ve örnek fotoğraf adımlarını örnek kişilerle gösterir. Yatay demo ekranındaki yakınlık göstergesi bir arayüz simülasyonudur.",
          ],
          [
            "Nodes by notwork",
            "Nodes, toplulukların kendi alanlarını kurması, üyelerin birbirini keşfetmesi ve etkinlik sırasında tanışması için geliştirilen ayrı bir deneyimdir. Web test görünümü örnek verilerle çalışır.",
          ],
        ],
      },
      {
        id: "sorular",
        title: "Sık sorulan sorular",
        faq: [
          [
            "Türkiye’de Notwork etkinliğini nereden bulurum?",
            "İzmir’deki ve Türkiye’deki buluşmalar Türkçe etkinlik takviminde, Almanya’daki buluşmalar Almanca takvimde yayımlanır.",
          ],
          [
            "Neden henüz eşleşmedim?",
            "Etkinlik ekibi henüz başlatmamış olabilir veya üçlü grup için yeterli uygun katılımcı yoktur. Kayıt tamamlandıysa tekrar kayıt açman gerekmez.",
          ],
          [
            "Match demosu gerçek katılımcı kullanıyor mu?",
            "Etkileşimli demo örnek gruplarla çalışır. Demo sohbeti, fotoğraf denemeleri ve yeniden eşleşmeler canlı etkinlik kayıtlarına eklenmez.",
          ],
        ],
      },
    ],
  },
  de: {
    title: "Technische Dokumentation | notwork Networking, Match und Events",
    description:
      "Technischer Leitfaden zu notwork Events, Registrierung, Matching, Gruppenchat, NTW Five, WordCloud, Mitgliedsprofilen und Eventverwaltung.",
    heading: "Technische Dokumentation zu notwork",
    lead: "notwork ist eine Networking-Plattform und Community aus İzmir. Sie verbindet Eventanmeldung, persönliche Begegnungen, Gruppenwerkzeuge und Kontakte nach dem Event. Dieser Leitfaden beschreibt die Abläufe für Teilnehmende und die Funktionen dahinter.",
    contents: "Inhaltsverzeichnis",
    journeyLabel: "Ablauf für Teilnehmende",
    journey: [
      "Event wählen",
      "Registrieren oder anmelden",
      "Gruppe finden",
      "Kennenlernen und beitragen",
      "In Kontakt bleiben",
    ],
    sections: [
      {
        id: "etkinlikler",
        title: "Plattform und Eventformate",
        summary:
          "notwork organisiert persönliche Events und entwickelt digitale Networking-Werkzeuge für den Einsatz vor Ort. Die Türkei und Deutschland haben eigene Eventkalender. Auf der Eventseite stehen Datum, Ort, Programm und Ticketstatus.",
        entries: [
          [
            "notwork Bühne",
            "Menschen erzählen von Rückschlägen und den Erfahrungen, die sie daraus mitgenommen haben. Je nach Programm ergänzen WordCloud und notwork Match die Vorträge.",
          ],
          [
            "notwork Fast",
            "Ein Format mit kurzen Begegnungen und mehr Zeit für Gespräche. Match, Five und freies Networking können je nach Programm dazugehören.",
          ],
        ],
        link: ["/etkinlikler", "Eventkalender öffnen"],
      },
      {
        id: "katilim",
        title: "Eventzugang, Profil und Sitzung",
        summary:
          "Das Mitgliedskonto enthält dein dauerhaftes Profil. Die Eventregistrierung erfasst deine Teilnahme, deine Antworten und deine Sitzung für ein bestimmtes Event.",
        entries: [
          [
            "Zugang",
            "Der Link, QR-Code oder Zugangscode des Eventteams führt zur Eventansicht. Registrierte Mitglieder können ihr Konto verwenden. Neue Teilnehmende durchlaufen die Registrierung.",
          ],
          [
            "Antworten für das Event",
            "Stell dich vor und beschreibe, welche Kontakte du suchst und was du beitragen kannst. Das Eventteam kann die Fragen für das Event anpassen.",
          ],
          [
            "Weitermachen",
            "Das System versucht, die bestehende Registrierung und eine offene Gruppe wiederherzustellen. Der Wechsel zurück zum Eventmenü beendet die Gruppe nicht.",
          ],
          [
            "Reihenfolge der Apps",
            "Die Eventkonfiguration bestimmt, welche Werkzeuge angezeigt werden und in welcher Reihenfolge sie erscheinen.",
          ],
        ],
        link: ["/ntw", "Eventansicht und Match-Demo öffnen"],
      },
      {
        id: "match",
        title: "Wie notwork Match Gruppen bildet",
        summary:
          "Match bildet Dreiergruppen aus verfügbaren Teilnehmenden. Die Auswahl erfolgt innerhalb des jeweiligen Events.",
        entries: [
          [
            "1. Verfügbare Teilnehmende",
            "Sobald das Eventteam das Matching startet, berücksichtigt das System passende freie Personen. Wer bereits in einer aktiven Gruppe ist, bekommt diese angezeigt. Bei zu wenigen Personen zeigt die App einen Wartezustand.",
          ],
          [
            "2. Bedürfnisse und Beiträge",
            "Die Bewertung prüft in beiden Richtungen, ob jemand etwas anbietet, das die andere Person sucht. Gemeinsame Begriffe sind ein zusätzliches Signal.",
          ],
          [
            "3. Eignung der Dreiergruppe",
            "Auch die Passung zwischen den vorgeschlagenen Personen und die Vielfalt ihrer Beiträge fließen ein. Neue Kontakte haben Vorrang. Bei einer kleinen Auswahl sind Wiederholungen möglich.",
          ],
          [
            "4. Gruppenzuordnung",
            "Gruppe und Mitgliedschaften werden gemeinsam gespeichert. Gleichzeitige Anfragen und Wiederholungen werden so verarbeitet, dass eine Person nur einer aktiven Gruppe angehört.",
          ],
        ],
      },
      {
        id: "ai",
        title: "NTW AI und regelbasierte Verarbeitung",
        entries: [
          [
            "Reihenfolge der Vorschläge",
            "Unter passenden Bedingungen kann KI die regelbasiert erstellte Auswahlliste neu sortieren. Eventzugehörigkeit und Verfügbarkeit werden zuvor geprüft.",
          ],
          [
            "Erläuterung zum Match",
            "Ein kurzer Hinweis auf dem Gruppenbildschirm kann ein gemeinsames Gesprächsthema oder eine mögliche Zusammenarbeit vorschlagen. Er stützt sich auf die angegebenen Bedürfnisse und Beiträge.",
          ],
          [
            "Bei Ausfällen",
            "Bei einem Zeitlimit, einer Nutzungsgrenze oder einer ungültigen Antwort kann das System die regelbasierte Auswahl und Erklärung verwenden. Die Gruppe kann ohne KI-Text geöffnet werden.",
          ],
        ],
      },
      {
        id: "grup",
        title: "Gruppenansicht, Chat und nächste Runde",
        entries: [
          [
            "Treffpunkt",
            "Gruppenname, Mitgliedsnamen und persönliche Codes helfen euch, einander vor Ort zu finden. Der Gruppenname kann groß angezeigt werden. Gesprächsimpulse helfen beim Einstieg.",
          ],
          [
            "Gruppenchat",
            "Lesen und Schreiben sind an die Eventsitzung und die aktive Gruppenmitgliedschaft gebunden. Im Chat könnt ihr einen Treffpunkt vereinbaren.",
          ],
          [
            "Nächste Runde",
            "Teilnehmende können ein neues Match anfragen. Wenn alle Mitglieder zugestimmt haben, wird die Gruppe geschlossen und verfügbare Personen kehren in den Pool zurück. Bei zu wenigen Personen erscheint der Wartezustand.",
          ],
          [
            "Foto und Bewertung",
            "Eine Person kann für das Gruppenfoto zuständig sein. Foto, Kommentar und Bewertung werden dem Event zugeordnet. Für die Veröffentlichung wird separat eine Einwilligung eingeholt.",
          ],
        ],
      },
      {
        id: "five",
        title: "Problemtische mit NTW Five",
        summary:
          "In Five bespricht eine kleine Gruppe ein konkretes Problem. Du kannst ein Problem einreichen oder einem offenen Tisch beitreten und bei der Lösung helfen.",
        entries: [
          [
            "Tisch und Gruppencode",
            "Ein Tisch mit vier Personen kommt für ein Problem zusammen. Gruppencode, Chat und Gesprächsansicht gehören zu diesem Tisch.",
          ],
          [
            "Fünf Minuten",
            "Mit dem Start der Runde beginnt der Countdown. Die Gruppe bespricht das Problem, schreibt ihren Lösungsvorschlag auf und bewertet das Ergebnis.",
          ],
          [
            "Nach der Runde",
            "Die für das Foto zuständige Person kann nach der Runde ein Gruppenfoto hinzufügen. Nach Lösung und Bewertung können Teilnehmende den Tisch verlassen und an einem weiteren Problem arbeiten.",
          ],
        ],
      },
      {
        id: "sahne-araclari",
        title: "WordCloud, Live-Abstimmung und Feedback",
        entries: [
          [
            "WordCloud",
            "Das Eventteam öffnet eine Frage. Antworten werden pro Frage erfasst und für die Gruppierung ähnlicher Schreibweisen normalisiert. Die Bühnenansicht zeigt die Verteilung.",
          ],
          [
            "Live-Abstimmung",
            "Bei Events wie Launchspace kann das Team Fragen und Antwortoptionen bearbeiten. Teilnehmende stimmen am Telefon ab. Auf der Bühne werden die Stimmen als Balken pro Option angezeigt.",
          ],
          [
            "Feedback nach dem Event",
            "Eine Umfrage kann nach der Erfahrung, neuen Kontakten und weiteren Treffen fragen. Das Eventteam kann die Ergebnisse im Verwaltungsbereich ansehen.",
          ],
        ],
      },
      {
        id: "topluluk",
        title: "Networking-Verzeichnis und ntw.business",
        entries: [
          [
            "Suche",
            "Das Verzeichnis lässt sich nach Name, Rolle und Fähigkeiten durchsuchen. Karten kennzeichnen verifizierte Mitglieder. Die türkische und deutsche Version verwenden dieselbe Gestaltung.",
          ],
          [
            "Kontakt und Empfehlungen",
            "Verifizierte Mitglieder können freigegebene Kontaktmöglichkeiten sehen. Sie können Empfehlungen für öffentliche Mitgliedskarten schreiben. Empfehlungen werden vor der Veröffentlichung geprüft.",
          ],
          [
            "Dauerhaftes Profil",
            "Dein Konto kann Foto, Biografie, Fähigkeiten, Erfahrungen, Kontakte und besuchte Events enthalten. Eine öffentliche ntw.business-Karte lässt sich per Link oder QR-Code teilen.",
          ],
        ],
        link: ["/networking", "Networking-Verzeichnis öffnen"],
      },
      {
        id: "veri",
        title: "Datenmodell und Sichtbarkeit",
        entries: [
          [
            "Mitglied → Eventteilnahme",
            "Ein Konto kann an mehreren Events teilnehmen. Eventantworten, persönlicher Code und aktives Match sind mit der jeweiligen Teilnahme verknüpft.",
          ],
          [
            "Event → Werkzeug → Datensatz",
            "Match-Gruppen, WordCloud-Antworten, Five-Tische und Abstimmungen werden im jeweiligen Werkzeugkontext gespeichert. Wo es unterstützt wird, können Demo- und Live-Daten getrennt werden.",
          ],
          [
            "Sichtbarkeit",
            "Eventantworten, Gruppenchat, öffentliche Mitgliedskarten und veröffentlichte Eventbewertungen haben unterschiedliche Sichtbarkeitsregeln. Die Einstellung für E-Mail-Mitteilungen wird separat erfasst.",
          ],
        ],
        link: ["/kvkk", "Datenschutzhinweise öffnen"],
      },
      {
        id: "yonetim",
        title: "Organisation und Bühnensteuerung",
        entries: [
          [
            "Einrichtung",
            "Das Eventteam legt Datum, Ort, Registrierungsfragen und Programmwerkzeuge fest. Es bestimmt, welche Werkzeuge in welcher Reihenfolge angezeigt werden.",
          ],
          [
            "Probe",
            "Teste Zugang, Matching, Bühnenansicht und Abstimmung mit Beispieldaten. Prüfe, welcher Datensatz für die Probe aktiv ist.",
          ],
          [
            "Live-Betrieb",
            "Teilnehmende melden sich im Event an. Das Team startet das Matching und kann passend zum Programm eine WordCloud-Frage, eine Abstimmung oder eine Mitteilung öffnen. Die Bühnenansicht kann separat angezeigt werden.",
          ],
          [
            "Nachbereitung",
            "Berechtigte Personen können Registrierungen, Matches, Werkzeugnutzung, Umfrageantworten und Feedback auswerten. Registrierungen, Sitzungen und Gruppen werden getrennt gezählt.",
          ],
        ],
      },
      {
        id: "mimari",
        title: "Webarchitektur und Testansichten",
        entries: [
          [
            "Webanwendung",
            "Die Oberfläche von notwork.me ist mit React und TypeScript umgesetzt. TanStack Router verwaltet die Seiten. Der Eventkalender, dieser Leitfaden und weitere öffentliche Seiten sind auch als serverseitig erzeugtes HTML lesbar.",
          ],
          [
            "Eventdienste",
            "Teilnahme, Matching, WordCloud und Five werden serverseitig verarbeitet. Ein Teil der Eventwerkzeuge speichert strukturierte Daten in Netlify Blobs. Die Teilnehmeransicht ruft den Zustand der Sitzung und der Gruppe vom Server ab.",
          ],
          [
            "Match-Demo",
            "Die Demo zeigt Registrierung, Wartebereich, Gruppenansicht, Chat und Beispielfoto mit fiktiven Personen. Die Näherungsanzeige im Querformat ist eine Simulation der Oberfläche.",
          ],
          [
            "Nodes by notwork",
            "Nodes ist eine separate Anwendung für Community-Bereiche, Mitgliederverzeichnisse und Begegnungen bei Veranstaltungen. Die Web-Testansicht verwendet Beispieldaten.",
          ],
        ],
      },
      {
        id: "sorular",
        title: "Häufig gestellte Fragen",
        faq: [
          [
            "Wo finde ich notwork Events?",
            "Treffen in Deutschland stehen im deutschen Eventkalender. Events in İzmir und in der Türkei findest du im türkischen Kalender.",
          ],
          [
            "Warum habe ich noch kein Match?",
            "Das Eventteam hat das Matching möglicherweise noch nicht gestartet, oder es fehlen verfügbare Personen für eine Dreiergruppe. Eine bestehende Registrierung kann weiterverwendet werden.",
          ],
          [
            "Verwendet die Demo echte Teilnehmende?",
            "Die interaktive Demo arbeitet mit Beispielgruppen. Nachrichten, Fotoversuche und neue Matches aus der Demo werden nicht in den Live-Eventdaten gespeichert.",
          ],
        ],
      },
    ],
  },
};
