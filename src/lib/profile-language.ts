import { useLocation } from "@tanstack/react-router";

const germanCopy: Record<string, string> = {
  "notwork profilin": "Dein notwork Profil",
  "Etkinlik katılımcısı olarak sana iletilen kullanıcı adı ve geçici şifreyle giriş yap.":
    "Melde dich mit deinem Benutzernamen oder deiner E-Mail-Adresse und deinem Passwort an.",
  "Kullanıcı adı veya e-posta": "Benutzername oder E-Mail-Adresse",
  Şifre: "Passwort",
  "Geçici şifren": "Dein vorläufiges Passwort",
  "Şifreyi gizle": "Passwort ausblenden",
  "Şifreyi göster": "Passwort anzeigen",
  "Şifremi unuttum": "Passwort vergessen",
  "Güvenli giriş": "Sicher anmelden",
  veya: "oder",
  "Yeni profil oluştur": "Neues Profil erstellen",
  "Networking’e dön": "Zurück zu Networking",
  "Kayıt için profil fotoğrafı yüklemelisin.": "Lade für die Registrierung ein Profilfoto hoch.",
  "Şifreler aynı olmalı.": "Die Passwörter müssen übereinstimmen.",
  "Giriş ekranına dön": "Zurück zur Anmeldung",
  "notwork profilini oluştur": "Erstelle dein notwork Profil",
  "Bilgilerini tamamladığında profilin anında aktif olur ve doğrudan hesabına geçersin.":
    "Sobald du deine Angaben ergänzt hast, ist dein Profil aktiv und du kannst dein Konto direkt nutzen.",
  "Notwork üyelik koşulu": "Voraussetzung für die Mitgliedschaft",
  "Notwork etkinliklerinden birine katıldıysan veya bir Notwork üyesinin referansıyla geliyorsan profilini oluşturup doğrudan kullanmaya başlayabilirsin.":
    "Wenn du an einem notwork Event teilgenommen hast oder von einem Mitglied empfohlen wurdest, kannst du dein Profil erstellen und direkt nutzen.",
  "Zorunlu profil fotoğrafını seç": "Erforderliches Profilfoto auswählen",
  "Profil önizlemesi": "Profilvorschau",
  "Profil fotoğrafı *": "Profilfoto *",
  "Zorunlu · yüzünün net göründüğü JPG, PNG veya WebP fotoğraf yükle.":
    "Erforderlich. Lade ein JPG-, PNG- oder WebP-Foto hoch, auf dem dein Gesicht gut zu erkennen ist.",
  "fotoğrafı değiştir": "Foto ändern",
  "fotoğraf seç": "Foto auswählen",
  "Ad soyad *": "Vor- und Nachname *",
  "Adın ve soyadın": "Dein Vor- und Nachname",
  "E-posta *": "E-Mail-Adresse *",
  "ornek@eposta.com": "beispiel@email.de",
  "Hangi Notwork etkinliğine katıldın? *": "An welchem notwork Event hast du teilgenommen? *",
  "Profil bilgisi": "Profilangabe",
  "Etkinliği seç": "Event auswählen",
  "Katıldığın etkinliği seç. Referans ile geliyorsan aşağıdaki alana seni tanıyan üyeyi yaz.":
    "Wähle dein Event aus. Wenn du empfohlen wurdest, gib unten das Mitglied an, das dich kennt.",
  "Bir Notwork üyesinin referansıyla başvuruyorum":
    "Ich wurde von einem notwork Mitglied empfohlen",
  "Notwork referansın *": "Deine notwork Empfehlung *",
  "ad, e-posta veya @kullanıcı adı": "Name, E-Mail-Adresse oder @Benutzername",
  "Seni referans gösteren Notwork üyesi": "Das notwork Mitglied, das dich empfohlen hat",
  "Profilde gösterilecek ülke": "Land im Profil",
  "Belirtmek istemiyorum": "Keine Angabe",
  "🇹🇷 Türkiye": "🇹🇷 Türkei",
  "🇩🇪 Almanya": "🇩🇪 Deutschland",
  "Kendini tanıt *": "Stell dich vor *",
  "Neler yaptığını, deneyimini ve seni tanımamız gereken detayları anlat.":
    "Erzähl uns, was du machst und welche Erfahrungen du mitbringst.",
  "Ne istiyorsun? *": "Was suchst du? *",
  "Aradığın bağlantıları, fırsatları, insanları veya projeleri detaylı anlat.":
    "Beschreibe die Kontakte, Möglichkeiten, Menschen oder Projekte, die du suchst.",
  "Neler yapabilirsin? *": "Wie kannst du helfen? *",
  "Topluluğa katabileceğin yetenekleri, deneyimleri ve desteği detaylı anlat.":
    "Beschreibe, welche Fähigkeiten, Erfahrungen und Unterstützung du einbringen kannst.",
  opsiyonel: "optional",
  Telefon: "Telefon",
  kullaniciadi: "benutzername",
  "05xx xxx xx xx": "+49 …",
  "Şifre *": "Passwort *",
  "10+ karakter, harf ve rakam": "Mindestens 10 Zeichen, Buchstaben und Zahlen",
  "Şifre tekrar *": "Passwort wiederholen *",
  "Kişisel verilerinin nasıl işlendiğini":
    "Wie wir deine personenbezogenen Daten verarbeiten, erfährst du in den",
  "KVKK Aydınlatma Metni": "Datenschutzhinweisen",
  "’nden inceleyebilirsin. Bu bilgilendirme, açık rıza tercihinden ayrıdır.":
    ". Die Datenschutzhinweise gelten unabhängig von deiner Einwilligung.",
  "Profil bilgilerimin notwork networking ağı, business kart ve üye referans sistemi içinde seçtiğim görünürlükte paylaşılmasına açık rıza veriyorum.":
    "Ich willige ein, dass meine Profilangaben im notwork Netzwerk, auf meiner Business-Karte und im Empfehlungssystem gemäß meiner Sichtbarkeitseinstellung geteilt werden.",
  "Açık Rıza Metni": "Einwilligung",
  "Profilimi oluştur": "Mein Profil erstellen",
  "ilk giriş": "Erste Anmeldung",
  Merhaba: "Hallo",
  "Profilini düzenlemeden önce yalnızca senin bildiğin yeni bir şifre oluştur.":
    "Lege vor dem Bearbeiten deines Profils ein neues, persönliches Passwort fest.",
  "Yeni şifre": "Neues Passwort",
  "Yeni şifre tekrar": "Neues Passwort wiederholen",
  "Şifremi oluştur": "Passwort festlegen",
  "Profilin kaydedildi.": "Dein Profil wurde gespeichert.",
  "Profil fotoğrafın güncellendi.": "Dein Profilfoto wurde aktualisiert.",
  "Profil fotoğrafını değiştir": "Profilfoto ändern",
  fotoğraf: "Foto",
  "Notwork Üyesi": "notwork Mitglied",
  "Katıldığım etkinlikler": "Meine besuchten Events",
  "Notwork yolculuğunda bulunduğun geceler.": "Die notwork Events, an denen du teilgenommen hast.",
  katıldın: "Teilgenommen",
  "Etkinliği gör": "Event ansehen",
  "Katıldığın etkinlikler hesabınla eşleştirildiğinde burada görünecek.":
    "Deine besuchten Events erscheinen hier, sobald sie deinem Konto zugeordnet sind.",
  "Edindiğim bağlantılar ve arkadaşlar": "Meine Kontakte",
  "Match Lab’de aynı gruba geldiğin üyeler ve iletişim bilgileri.":
    "Mitglieder aus deinen Match-Gruppen und ihre freigegebenen Kontaktinformationen.",
  "Bağlantıların yükleniyor": "Kontakte werden geladen …",
  "Notwork community üyesi": "Mitglied der notwork Community",
  "Match Lab’de eşleştiniz": "Ihr wart in derselben Match-Gruppe",
  "e-posta": "E-Mail",
  telefon: "Telefon",
  "profili gör": "Profil ansehen",
  "Tamamladığın Match Lab buluşmalarındaki kişiler burada birikecek.":
    "Hier findest du die Personen aus deinen abgeschlossenen Match-Runden.",
  "ntw kodun": "Dein ntw Code",
  "E-posta adresinle oluşturulan bu kod hesabına sabittir.":
    "Dieser Code wird anhand deiner E-Mail-Adresse erstellt und bleibt deinem Konto zugeordnet.",
  "Bu kodlar yalnızca sana görünür; ntw.business kartında paylaşılmaz.":
    "Diese Codes sind nur für dich sichtbar. Auf deiner ntw.business-Karte werden sie nicht angezeigt.",
  "Profil başlığı": "Profilüberschrift",
  "Örn. Ürün tasarımcısı ve topluluk kurucusu": "Z. B. Produktdesignerin und Community-Gründerin",
  "Kısa biyografi": "Kurzbiografie",
  "Neler yaptığını ve neye açık olduğunu kısa anlat.":
    "Beschreibe kurz, was du machst und wofür du offen bist.",
  "En güçlü 5 yeteneğin": "Deine fünf wichtigsten Fähigkeiten",
  Ekle: "Hinzufügen",
  "Ünvanından çok gerçekten yapabildiklerini yaz. En fazla 5 yetenek.":
    "Nenne bis zu fünf konkrete Fähigkeiten.",
  "Yeteneği sil": "Fähigkeit entfernen",
  "İlk yeteneğini ekle": "Erste Fähigkeit hinzufügen",
  Deneyimlerin: "Deine Erfahrungen",
  "Çalıştığın veya staj yaptığın en fazla 3 yeri ekle.":
    "Füge bis zu drei Arbeitsstellen oder Praktika hinzu.",
  Firma: "Unternehmen",
  "Rol / staj": "Rolle / Praktikum",
  "Deneyimi kaldır": "Erfahrung entfernen",
  "İlk deneyimini ekle": "Erste Erfahrung hinzufügen",
  Bağlantıların: "Deine Links",
  "Yalnızca giriş yapmış üyeler görür": "Sichtbar für angemeldete Mitglieder",
  "Instagram kullanıcı adı": "Instagram-Benutzername",
  "Web sitesi": "Website",
  "ntw.business share": "ntw.business teilen",
  "Business kartını dışarıya aç": "Business-Karte öffentlich machen",
  "E-posta adresin paylaşılmaz. Yalnızca profilinde yazdığın bilgiler görünür.":
    "Deine E-Mail-Adresse bleibt privat. Sichtbar sind nur deine öffentlichen Profilangaben.",
  "senin business linkin": "Dein Business-Link",
  "QR ve bağlantı, profilini kaydedip görünür yaptığında çalışır.":
    "Der QR-Code und der Link funktionieren, sobald dein Profil gespeichert und öffentlich ist.",
  kopyalandı: "Kopiert",
  "linki kopyala": "Link kopieren",
  "kartı gör": "Karte ansehen",
  "Profili kaydet": "Profil speichern",
  "Çıkış yap": "Abmelden",
  "Doğrulanmış Notwork üye profili": "Verifiziertes notwork Mitgliedsprofil",
  "Bu kart yayında değil.": "Diese Karte ist nicht öffentlich.",
  "Üye kartı henüz paylaşılmamış veya bağlantı artık kullanılamıyor.":
    "Die Mitgliedskarte wurde noch nicht veröffentlicht oder der Link ist nicht mehr gültig.",
  "Notwork community’yi gör": "Zur notwork Community",
  "paylaşılabilir profil": "Teilbares Profil",
  "Doğrulanmış Notwork Üyesi": "Verifiziertes notwork Mitglied",
  Yapabildikleri: "Fähigkeiten",
  Deneyim: "Erfahrung",
  "Bu business kartı açmak için QR kodu okut.":
    "Scanne den QR-Code, um diese Business-Karte zu öffnen.",
  "Bağlantı kopyalandı": "Link kopiert",
  "Kartı paylaş": "Karte teilen",
  "genel yetkinlik": "Allgemeine Fähigkeit",
  "Referansın admin onayına gönderildi.": "Deine Empfehlung wurde zur Prüfung eingereicht.",
  "Referans gönderilemedi.": "Die Empfehlung konnte nicht gesendet werden.",
  "Üye referansları": "Empfehlungen von Mitgliedern",
  "Bu profil için henüz yayınlanmış üye referansı yok.":
    "Für dieses Profil gibt es noch keine veröffentlichten Empfehlungen.",
  "Kendi profiline referans yazamazsın. Başka bir Notwork üyesinin kartından ona referans olabilirsin.":
    "Du kannst anderen Mitgliedern über ihre Business-Karte eine Empfehlung schreiben.",
  "Bu üyeye referans ol": "Dieses Mitglied empfehlen",
  "Yalnızca doğrulanmış Notwork üyeleri yazabilir. Adın ve kullanıcı adın, admin onayından sonra referansla birlikte görünür.":
    "Verifizierte notwork Mitglieder können Empfehlungen schreiben. Nach der Freigabe erscheinen dein Name und dein Benutzername neben der Empfehlung.",
  "Referans verilen yetenek": "Empfohlene Fähigkeit",
  "hangi konuda iyi?": "Welche Fähigkeit möchtest du empfehlen?",
  "Bu kişinin bu konuda neden iyi olduğunu birlikte çalışma deneyiminle anlat.":
    "Beschreibe anhand eurer Zusammenarbeit, was diese Person gut kann.",
  "Referansı gönder": "Empfehlung senden",
  "Referans yazmak için doğrulanmış üye hesabınla giriş yap.":
    "Melde dich mit einem verifizierten Konto an, um eine Empfehlung zu schreiben.",
  "Üye girişi": "Anmelden",
  "Şifreler eşleşmiyor": "Die Passwörter stimmen nicht überein",
  "Şifre yenilenemedi": "Das Passwort konnte nicht zurückgesetzt werden",
  "Şifren yenilendi": "Dein Passwort wurde geändert",
  "E-postanı kontrol et": "Prüfe dein E-Mail-Postfach",
  "Yeni şifrenle hemen giriş yapabilirsin. Diğer cihazlardaki açık oturumların kapatıldı.":
    "Du kannst dich mit deinem neuen Passwort anmelden. Andere offene Sitzungen wurden beendet.",
  "Bu adrese bağlı bir profil varsa 30 dakika geçerli güvenli yenileme bağlantısını gönderdik.":
    "Wenn ein Profil mit dieser Adresse verknüpft ist, haben wir dir einen Link geschickt, der 30 Minuten gültig ist.",
  "Girişe dön": "Zurück zur Anmeldung",
  "← girişe dön": "← Zurück zur Anmeldung",
  "Şifreni yenile": "Passwort zurücksetzen",
  "Yeni şifreni belirle. Bu bağlantı yalnızca bir kez kullanılabilir.":
    "Lege dein neues Passwort fest. Dieser Link kann einmal verwendet werden.",
  "Profilinde kayıtlı e-posta adresini yaz. Güvenli yenileme bağlantısı doğrudan adresine gelsin.":
    "Gib die E-Mail-Adresse deines Profils ein, um einen sicheren Link zu erhalten.",
  "E-posta": "E-Mail-Adresse",
  "En az 10 karakter · harf ve rakam": "Mindestens 10 Zeichen, Buchstaben und Zahlen",
  "Şifre yenileniyor…": "Passwort wird geändert …",
  "Bağlantı gönderiliyor…": "Link wird gesendet …",
  "Şifremi şimdi yenile": "Passwort jetzt ändern",
  "Yenileme bağlantısını gönder": "Link zum Zurücksetzen senden",
  "notwork’ten haber almak istiyorum · isteğe bağlı":
    "Ich möchte Nachrichten von notwork erhalten · freiwillig",
  "Adımın ve e-posta adresimin notwork etkinlik, bilet ve topluluk duyuruları için kullanılmasına ve bana e-posta ile ticari elektronik ileti gönderilmesine izin veriyorum. İzin isteğe bağlıdır; dilediğim zaman ücretsiz ayrılabilirim.":
    "Ich willige ein, dass notwork meinen Namen und meine E-Mail-Adresse nutzt, um mir Werbung und Informationen zu Events, Tickets und der Community zu senden. Ich kann diese freiwillige Einwilligung jederzeit kostenlos widerrufen.",
};

export function useProfileLanguage() {
  const { pathname } = useLocation();
  const german = pathname.startsWith("/de/");
  return { german, t: (text: string) => (german ? (germanCopy[text] ?? text) : text) };
}
