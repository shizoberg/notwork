export type NtwAssistantAnswer = {
  id: string;
  answer: string;
  cta?: string;
  href?: string;
  keywords: string[];
};

export const ntwQuickQuestions = [
  "notwork nedir?",
  "yeni etkinlik ne zaman?",
  "networking ağına nasıl katılırım?",
  "sunum yapmak istiyorum",
] as const;

const answers: NtwAssistantAnswer[] = [
  {
    id: "greeting",
    answer:
      "selam! Ben ntw. Etkinlikler, networking ağı, sunum başvurusu, sponsorluk veya community hakkında sana yardımcı olabilirim.",
    keywords: ["selam", "merhaba", "hey", "gunaydin", "iyi aksamlar"],
  },
  {
    id: "about",
    answer:
      "notwork, İzmir’de başarısızlık hikâyelerinin anlatıldığı bir network club. Konuşmacılar uğraşıp olduramadıkları deneyimleri ve bu deneyimlerden çıkardıkları doğru dersleri paylaşır; ardından insanlar networking ve community sistemiyle doğru bağlantılar kurar.",
    cta: "notwork’ü adım adım keşfet",
    href: "/notwork-nedir",
    keywords: [
      "notwork nedir",
      "siz kimsiniz",
      "ne yapiyorsunuz",
      "network club",
      "felsefe",
      "basarisizlik hikayesi",
      "fckup",
      "fuckup",
    ],
  },
  {
    id: "next-event",
    answer:
      "Yeni notwork gecesinin tarihi ve konuşmacıları henüz açıklanmadı. Duyuru ilk olarak WhatsApp community kanalında paylaşılacak; şu anda aktif bir bilet bağlantısı bulunmuyor.",
    cta: "WhatsApp community’ye katıl",
    href: "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE",
    keywords: [
      "yeni etkinlik",
      "siradaki etkinlik",
      "etkinlik ne zaman",
      "yaklasan etkinlik",
      "bilet",
      "bilet al",
      "tarih",
      "konusmacilar ne zaman",
      "nerede olacak",
      "yeni event",
    ],
  },
  {
    id: "events",
    answer:
      "notwork 20’den fazla buluşma gerçekleştirdi. Etkinlik kataloğunda 21 Ağustos ve 14 Temmuz geceleri dahil geçmiş etkinlikleri, lokasyonları, yaklaşık katılımcı sayılarını ve etkinlik detaylarını inceleyebilirsin.",
    cta: "etkinlik kataloğunu aç",
    href: "/etkinlikler",
    keywords: [
      "etkinlikler",
      "gecmis etkinlik",
      "eventler",
      "etkinlik katalogu",
      "onceki etkinlik",
      "21 agustos",
      "14 temmuz",
      "rene lokal",
      "mahal bomonti",
      "istinyeart",
    ],
  },
  {
    id: "event-flow",
    answer:
      "Bir notwork gecesinde karşılama, interaktif anket oyunu, kısa başarısızlık hikâyeleri, bu hikâyelerden çıkarılan dersler, ntw.match.lab eşleştirmeleri ve networking akışı bulunur. Etkinlik sonrasında bağ community içinde devam eder.",
    cta: "event akışını gör",
    href: "/notwork-nedir",
    keywords: [
      "etkinlik nasil",
      "event akisi",
      "etkinlik akisi",
      "orada ne oluyor",
      "program",
      "kac konusmaci",
      "ne kadar suruyor",
      "anket oyunu",
      "wordcloud",
    ],
  },
  {
    id: "networking",
    answer:
      "Networking ağına adın, e-postan, kendini nasıl tanımladığın, ne aradığın ve topluluğa ne katabileceğin bilgileriyle kayıt olabilirsin. Profilin community ağında görünür; bağlantı önerileri ortak ilgi, ihtiyaç ve katkı alanlarına göre oluşturulur.",
    cta: "networking ağına katıl",
    href: "/networking",
    keywords: [
      "networking agi",
      "aga katil",
      "network genislet",
      "profil olustur",
      "kayit ol",
      "insanlarla tanis",
      "eslesme bul",
      "networke katil",
      "kullanici adi",
      "username",
    ],
  },
  {
    id: "update-profile",
    answer:
      "Networking sayfasındaki “verilerimi güncellemek istiyorum” seçeneğini kullan. Kullanıcı adını girerek mevcut bilgilerini bulabilir ve değişiklik talebini gönderebilirsin; talep admin onayından sonra ağda güncellenir.",
    cta: "profilimi güncelle",
    href: "/networking",
    keywords: [
      "bilgilerimi guncelle",
      "profilimi duzenle",
      "verilerimi degistir",
      "kartimi duzenle",
      "kaydimi guncelle",
    ],
  },
  {
    id: "match-lab",
    answer:
      "ntw.match.lab v1.0, etkinlik günü kayıt sırasında paylaşılan niyet, ihtiyaç ve katkı alanlarını okuyarak konuşma ihtimali yüksek kişileri üçlü gruplarda buluşturan eşleştirme sistemidir. Sistem yalnızca etkinliğe özel link veya QR üzerinden kullanılır.",
    cta: "Match Lab sistemini incele",
    href: "/match-lab",
    keywords: [
      "match lab",
      "matchlab",
      "eslestirme sistemi",
      "ai eslestirme",
      "yapay zeka",
      "network kodu",
      "uclu grup",
      "eslesmem",
    ],
  },
  {
    id: "community",
    answer:
      "notwork community 500’den fazla üyeye ve 20’den fazla buluşmaya ulaştı. WhatsApp kanalında yeni etkinlik duyuruları paylaşılır; fotoğraflar, yorumlar ve networking ağıyla etkinlikten sonra da bağlantı devam eder.",
    cta: "community sayfasını aç",
    href: "/community",
    keywords: [
      "community",
      "topluluk",
      "kac kisi",
      "uye sayisi",
      "whatsapp toplulugu",
      "whatsapp community",
      "duyuru kanali",
    ],
  },
  {
    id: "whatsapp",
    answer:
      "Yeni etkinlikleri ve community duyurularını kaçırmamak için notwork WhatsApp community kanalına katılabilirsin.",
    cta: "WhatsApp’a katıl",
    href: "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE",
    keywords: ["whatsapp", "duyuru", "topluluga katil", "grup linki", "kanala katil"],
  },
  {
    id: "presentation",
    answer:
      "Başarısızlık hikâyeni notwork sahnesinde anlatmak istiyorsan sunum başlığını, hikâyeni ve iletişim bilgilerini sunum formundan gönderebilirsin. Ekip başvurunu inceleyip WhatsApp üzerinden dönüş yapar.",
    cta: "sunum başvurusu gönder",
    href: "/sunum-yukle",
    keywords: [
      "sunum yap",
      "konusmaci ol",
      "hikayemi anlat",
      "sahneye cik",
      "sunum gonder",
      "sunum basvurusu",
      "konusmaci basvurusu",
    ],
  },
  {
    id: "sponsor",
    answer:
      "notwork’te etkinlik isim sponsorluğu, etkinlik alanı sponsorluğu, ürün yerleştirme, ürün deneyimi ve marka tanıtımı seçenekleri bulunur. Markaya uygun özel konsept ve içerik üretimi de birlikte tasarlanabilir.",
    cta: "sponsorluk seçeneklerini gör",
    href: "/sponsor",
    keywords: [
      "sponsor",
      "sponsorluk",
      "marka is birligi",
      "urun yerlestirme",
      "markami tanit",
      "reklam",
      "isim sponsorlugu",
    ],
  },
  {
    id: "startup",
    answer:
      "Kendi işini veya startup projesini geliştirenler projelerini notwork’e anlatabilir. Formda proje, ekip, aşama ve ihtiyaçlarını paylaşabilirsin; başvurular ekip tarafından incelenir ve uygun projelerle online görüşme planlanır.",
    cta: "startup projemi anlat",
    href: "/startup",
    keywords: [
      "startup",
      "girisimin var",
      "projemi anlat",
      "kendi isimi kur",
      "yatirimci",
      "proje gelistir",
      "pazarlama destegi",
    ],
  },
  {
    id: "reviews",
    answer:
      "Katıldığın notwork etkinliğini seçip 5 yıldız üzerinden puanlayabilir, yorumunu yazabilir ve isteğe bağlı fotoğraf ekleyebilirsin. Ekibe özel not alanı yalnızca notwork ekibine iletilir.",
    cta: "etkinliği yorumla",
    href: "/etkinlik-degerlendirme",
    keywords: [
      "yorum yap",
      "etkinligi puanla",
      "degerlendirme",
      "fotograf yukle",
      "geri bildirim",
      "feedback",
    ],
  },
  {
    id: "gallery",
    answer:
      "Etkinlik fotoğrafları ve community anları community galerisinde; katılımcı yorumları ise ana sayfa ve etkinlik detaylarında yer alıyor.",
    cta: "fotoğraf galerisine git",
    href: "/community#galeri",
    keywords: ["galeri", "fotograflar", "etkinlik fotograflari", "roportaj", "videolar"],
  },
  {
    id: "contact",
    answer:
      "Etkinlik ve genel sorular için WhatsApp üzerinden notwork ekibine yazabilirsin. Sunum ve sponsorluk başvurularında ilgili sayfalardaki formları kullanman, talebinin doğru kişiye ulaşmasını hızlandırır.",
    cta: "WhatsApp’tan yaz",
    href: "https://wa.me/905457210929?text=Merhaba%20notwork%2C%20bilgi%20almak%20istiyorum.",
    keywords: [
      "iletisim",
      "size nasil ulasirim",
      "mail",
      "telefon",
      "mesaj at",
      "destek",
      "yardim",
    ],
  },
  {
    id: "privacy",
    answer:
      "Kayıt formlarında e-posta ve profil bilgilerinin hangi amaçlarla işlendiği KVKK metninde açıklanır. Networking ağına kayıt olurken görünürlük ve iletişim onayını ayrıca vermen gerekir.",
    cta: "KVKK metnini incele",
    href: "/kvkk",
    keywords: ["kvkk", "gizlilik", "verilerim", "kisisel veri", "onay", "izin"],
  },
  {
    id: "thanks",
    answer: "rica ederim! Başka bir konuda da yardımcı olabilirim.",
    keywords: ["tesekkur", "sag ol", "eyvallah", "super", "harika"],
  },
];

const fallbackAnswer: NtwAssistantAnswer = {
  id: "fallback",
  answer:
    "Bunu site bilgilerinde net olarak eşleştiremedim. Etkinlikler, networking ağı, Match Lab, sunum başvurusu, sponsorluk, startup veya WhatsApp community hakkında sorarsan hemen doğru bilgiyi bulabilirim. İstersen ekibe de yazabilirsin.",
  cta: "notwork ekibine yaz",
  href: "https://wa.me/905457210929?text=Merhaba%20notwork%2C%20bilgi%20almak%20istiyorum.",
  keywords: [],
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreKeyword(message: string, keyword: string) {
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) return 0;
  if (message === normalizedKeyword) return 20;
  if (message.includes(normalizedKeyword)) return 8 + normalizedKeyword.split(" ").length;

  const messageTokens = new Set(message.split(" "));
  const keywordTokens = normalizedKeyword.split(" ");
  const matchingTokens = keywordTokens.filter((token) => messageTokens.has(token)).length;

  if (keywordTokens.length === 1) return matchingTokens ? 3 : 0;
  if (matchingTokens === keywordTokens.length) return 6;
  return matchingTokens >= Math.ceil(keywordTokens.length * 0.66) ? matchingTokens : 0;
}

export function findNtwAssistantAnswer(message: string) {
  const normalizedMessage = normalize(message);
  if (!normalizedMessage) return fallbackAnswer;

  let bestAnswer = fallbackAnswer;
  let bestScore = 0;

  for (const answer of answers) {
    const score = Math.max(
      0,
      ...answer.keywords.map((keyword) => scoreKeyword(normalizedMessage, keyword)),
    );
    if (score > bestScore) {
      bestAnswer = answer;
      bestScore = score;
    }
  }

  return bestScore >= 3 ? bestAnswer : fallbackAnswer;
}
