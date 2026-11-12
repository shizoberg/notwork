const germanHomeText: Record<string, string> = {
  "Network etkinlikleri ve çözümleri üreten networking platformu.":
    "Eine Plattform für Networking-Events und neue Verbindungen.",
  "Sonraki etkinlikler": "Kommende Events",
  "Sonraki buluşmalar": "Kommende Treffen",
  "Bir notwork eventinde": "Bei notwork",
  "deneyiminde seni ne bekliyor?": "Was erwartet dich?",
  "Etkinliği incele ↗": "Event ansehen ↗",
  "Önceki etkinlik akışı": "Vorheriges Format",
  "Sonraki etkinlik akışı": "Nächstes Format",
  "Etkinlik slaytı göstergesi": "Eventformat wählen",
  "Başarısızlık hikayeleri": "Geschichten vom Scheitern",
  "Deneyip olmadığında yaşananları ilk ağızdan dinle.":
    "Höre aus erster Hand, was schiefging und warum.",
  "İşe yarayan dersler": "Erfahrungen, die weiterhelfen",
  "Deneyimlerden kendi yoluna bir şeyler al.": "Nimm etwas für deinen eigenen Weg mit.",
  "İnteraktif sahne": "Interaktive Bühne",
  "WordCloud ve mini oyunlarla seyirci de akışa katılır.":
    "Mit einer Wortwolke und kurzen Spielen macht das Publikum mit.",
  "Sonra networking": "Danach Networking",
  "Sunum sonrası ntw.match.lab ile doğru bağlantı zamanı.":
    "Nach den Vorträgen bringt notwork Match passende Menschen zusammen.",
  "Problemini hızlıca çöz": "Schnell Lösungen finden",
  "ntw.five ile problemini anlayıp çözüm üretebilecek gerçek bağlantılar edin.":
    "Mit ntw.five findest du Menschen, die deine Herausforderung verstehen und mitdenken.",
  "İşine yarayan bağlantılar": "Kontakte, die weiterhelfen",
  "Etkinlikten sonra da iletişimde kalacağın güçlü bir network oluştur.":
    "Knüpfe Kontakte, die über das Event hinaus bestehen.",
  "Doğru insanlarla tanış": "Passende Menschen treffen",
  "ntw.match.lab ile ihtiyacına, niyetine ve katkına uygun insanları bul.":
    "Lerne Menschen kennen, deren Interessen und Stärken zu deinen passen.",
  "DJ, canlı müzik, keyifli ortam": "DJ, Live-Musik und lockere Atmosphäre",
  "Sıkıcı kartvizit trafiği yerine community enerjisiyle rahatça tanış.":
    "Komm in entspannter Atmosphäre mit anderen ins Gespräch.",
  etkinlikler: "Events",
  "notwork geceleri": "notwork Abende",
  "Geçmiş notwork gecelerinden hikâyeleri, yorumları ve etkinlik arşivini burada topluyoruz.":
    "Geschichten, Stimmen und Bilder aus vergangenen notwork Abenden.",
  "Tüm etkinlikleri gör": "Alle Events ansehen",
  "notwork gecesi": "notwork Abend",
  "Geçmiş event": "Vergangenes Event",
  değerlendirme: "Bewertungen",
  "Event sayfasına git": "Zum Event",
  "Arşiv kaydı": "Archiv",
  "katılımcı yorumları": "Stimmen der Teilnehmenden",
  "O geceden kalanlar.": "Was vom Abend bleibt.",
  "notwork katılımcısı": "notwork Teilnehmer:in",
  "Daha az göster": "Weniger anzeigen",
  "Devamını oku": "Weiterlesen",
  "Önceki eventlerden": "Bilder vergangener Events",
  "Kaydır veya oklarla fotoğrafları incele.":
    "Wische oder nutze die Pfeile, um durch die Fotos zu blättern.",
  "Önceki fotoğraf": "Vorheriges Foto",
  "Sonraki fotoğraf": "Nächstes Foto",
  "Sık sorulanlar": "Häufig gestellte Fragen",
  "Aklında kalan her şey, hızlıca.": "Die wichtigsten Antworten auf einen Blick.",
};
export const homeText = (german: boolean) => (text: string) =>
  german ? (germanHomeText[text] ?? text) : text;

export const germanFaq = [
  {
    q: "Was ist notwork?",
    a: "notwork veranstaltet Treffen in der Türkei und in Deutschland. Wir teilen persönliche Erfahrungen und lernen neue Menschen kennen.",
  },
  {
    q: "Wer steht auf der Bühne?",
    a: "Vier Menschen erzählen in je zehn Minuten, was sie erlebt und daraus gelernt haben.",
  },
  {
    q: "Wie entstehen die Themen?",
    a: "Wir hören Geschichten aus drei Bereichen: Karriere, Beziehungen und Abenteuer.",
  },
  {
    q: "Wann beginnt das Networking?",
    a: "Nach den Vorträgen. Zum Auftakt reicht ein interaktives Spiel das Mikrofon ans Publikum weiter.",
  },
  {
    q: "Kann ich selbst auf die Bühne?",
    a: "Ja. Schick uns deine Geschichte über das Vortragsformular. Wir melden uns bei dir.",
  },
];

export const germanArchive: Record<string, { date: string; title: string; text: string }> = {
  "11-ekim-2026": {
    date: "11. Oktober 2026",
    title: "notwork Bühne",
    text: "Geschichten vom Scheitern, eine interaktive Wortwolke und neue Kontakte mit notwork Match.",
  },
  "17-eylul-2026": {
    date: "17. September 2026",
    title: "notwork Fast",
    text: "Ein Abend mit notwork Match, ntw.five, DJ und freiem Networking.",
  },
  "21-agustos-2026": {
    date: "21. August 2026",
    title: "notwork İzmir im August",
    text: "Geschichten vom Scheitern, notwork Match, WordCloud und Gespräche nach dem Programm im Rene Lokal.",
  },
  "14-temmuz-2026": {
    date: "14. Juli 2026",
    title: "notwork İzmir im Juli",
    text: "Ein interaktives Bühnenprogramm mit vier Vorträgen und Zeit für neue Kontakte.",
  },
  "22-mayis": {
    date: "22. Mai",
    title: "notwork im Mai",
    text: "Ein Networking-Abend über berufliche Umwege, gescheiterte Vorhaben und neue Wege.",
  },
  "10-nisan": {
    date: "10. April",
    title: "notwork Bühne im April",
    text: "Ein Abend über Kommunikation, Zusammenarbeit und das, was wir aus Fehlern lernen.",
  },
  "8-mart": {
    date: "8. März",
    title: "notwork zum 8. März",
    text: "Persönliche Geschichten über Mut, Wendepunkte und Neuanfänge.",
  },
  "10-subat": {
    date: "10. Februar",
    title: "notwork im Februar",
    text: "Was bleibt von falschen Entscheidungen und Vorhaben, die wir nicht zu Ende gebracht haben?",
  },
  "16-ocak": {
    date: "16. Januar",
    title: "notwork im Januar",
    text: "Geschichten über Pläne, die scheitern, und die Möglichkeiten, die sich danach ergeben.",
  },
  "8-aralik": {
    date: "8. Dezember",
    title: "notwork im Dezember",
    text: "Eines der ersten notwork Treffen, bei dem Geschichten vom Scheitern den Einstieg ins Gespräch erleichterten.",
  },
};

export const englishHomeText: Record<string, string> = {
  "Network etkinlikleri ve çözümleri üreten networking platformu.": "A networking platform for live events and meaningful connections.",
  "Sonraki etkinlikler": "Upcoming events",
  "Sonraki buluşmalar": "Upcoming meetups",
  "Bir notwork eventinde": "At a notwork event",
  "deneyiminde seni ne bekliyor?": "What to expect",
  "Etkinliği incele ↗": "Explore the event ↗",
  "Önceki etkinlik akışı": "Previous format",
  "Sonraki etkinlik akışı": "Next format",
  "Etkinlik slaytı göstergesi": "Choose an event format",
  "Başarısızlık hikayeleri": "Stories of failure",
  "Deneyip olmadığında yaşananları ilk ağızdan dinle.": "Hear firsthand what went wrong and what people learned.",
  "İşe yarayan dersler": "Lessons you can use",
  "Deneyimlerden kendi yoluna bir şeyler al.": "Take ideas from other people’s experiences into your own work.",
  "İnteraktif sahne": "Interactive stage",
  "WordCloud ve mini oyunlarla seyirci de akışa katılır.": "Join in through live word clouds and short games.",
  "Sonra networking": "Then, networking",
  "Sunum sonrası ntw.match.lab ile doğru bağlantı zamanı.": "After the talks, notwork Match helps you find people to meet.",
  "Problemini hızlıca çöz": "Work through a challenge",
  "ntw.five ile problemini anlayıp çözüm üretebilecek gerçek bağlantılar edin.": "Meet people who can help you think through a challenge with ntw.five.",
  "İşine yarayan bağlantılar": "Connections that last",
  "Etkinlikten sonra da iletişimde kalacağın güçlü bir network oluştur.": "Build relationships that continue after the event.",
  "Doğru insanlarla tanış": "Meet the right people",
  "ntw.match.lab ile ihtiyacına, niyetine ve katkına uygun insanları bul.": "Meet people whose interests and skills complement yours.",
  "DJ, canlı müzik, keyifli ortam": "DJ, live music and a relaxed atmosphere",
  "Sıkıcı kartvizit trafiği yerine community enerjisiyle rahatça tanış.": "Get to know people in a relaxed setting.",
  etkinlikler: "Events",
  "notwork geceleri": "notwork nights",
  "Geçmiş notwork gecelerinden hikâyeleri, yorumları ve etkinlik arşivini burada topluyoruz.": "Stories, reviews and photos from past notwork events.",
  "Tüm etkinlikleri gör": "See all events",
  "notwork gecesi": "notwork night",
  "Geçmiş event": "Past event",
  değerlendirme: "reviews",
  "Event sayfasına git": "View event",
  "Arşiv kaydı": "Archive",
  "katılımcı yorumları": "Attendee reviews",
  "O geceden kalanlar.": "Memories from the night.",
  "notwork katılımcısı": "notwork attendee",
  "Daha az göster": "Show less",
  "Devamını oku": "Read more",
  "Önceki eventlerden": "Photos from past events",
  "Kaydır veya oklarla fotoğrafları incele.": "Swipe or use the arrows to browse the photos.",
  "Önceki fotoğraf": "Previous photo",
  "Sonraki fotoğraf": "Next photo",
  "Sık sorulanlar": "Frequently asked questions",
  "Aklında kalan her şey, hızlıca.": "Quick answers to common questions.",
};

export const englishFaq = [
  { q: "What is notwork?", a: "notwork hosts meetups in Türkiye and Germany where people share personal experiences and make new connections." },
  { q: "Who speaks on stage?", a: "Four speakers each share a ten-minute story about an experience and what they learned from it." },
  { q: "How are topics chosen?", a: "Stories cover three areas: careers, relationships and adventures." },
  { q: "When does networking start?", a: "After the talks. We start with an interactive game that passes the microphone to the audience." },
  { q: "Can I speak at an event?", a: "Yes. Send your story through the speaker form and the team will get in touch." },
];

export const englishArchive: typeof germanArchive = Object.fromEntries([
  ["11-ekim-2026", "11 October 2026", "notwork Stage", "Stories of failure, a live word cloud and new connections with notwork Match."],
  ["17-eylul-2026", "17 September 2026", "notwork Fast", "An evening of notwork Match, ntw.five, music and open networking."],
  ["21-agustos-2026", "21 August 2026", "notwork İzmir in August", "Stories of failure, Match, WordCloud and conversations at Rene Lokal."],
  ["14-temmuz-2026", "14 July 2026", "notwork İzmir in July", "An interactive programme with four talks and time to meet new people."],
  ["22-mayis", "22 May", "notwork in May", "A networking evening about career detours, setbacks and new paths."],
  ["10-nisan", "10 April", "notwork Stage in April", "An evening about communication, teamwork and learning from mistakes."],
  ["8-mart", "8 March", "notwork on 8 March", "Personal stories of courage, turning points and new beginnings."],
  ["10-subat", "10 February", "notwork in February", "Stories of difficult decisions and unfinished projects."],
  ["16-ocak", "16 January", "notwork in January", "Stories of failed plans and the opportunities that followed."],
  ["8-aralik", "8 December", "notwork in December", "An early notwork meetup where stories of failure opened up conversations."],
].map(([id, date, title, text]) => [id, { date, title, text }]));
