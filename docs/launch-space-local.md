# Launch Space · 14 Kasım 2026 yerel demo

Kapsam: Nodes Flutter tasarımındaki koyu zemin (#0d0e10), yüzey (#191a1d), açık mavi (#9bc8dc), adım adım onboarding ve uygulama içi gezinmeyi mevcut Notwork event backend'ine taşıyan ayrı React deneyimi. Gerçek Nodes hesabı açılmaz; Notwork etkinlik profili kullanılır. `/linkler`, bilet sayfaları ve canlı etkinlikler değiştirilmez.

## Çalıştırma

İki terminal, `notwork-match-deploy` klasöründe:

```sh
npm run dev -- --host 127.0.0.1 --port 5210
node scripts/local-launch-space.mjs
```

- Katılımcı: http://127.0.0.1:5211/launch-space
- Organizatör: http://127.0.0.1:5211/launch-space-kontrol
- Sahne: http://127.0.0.1:5211/launch-space-sahne
- Genel admin: http://127.0.0.1:5211/admin
- Test yönergeleri: http://127.0.0.1:5211/__launch-space

Yerel örnek admin/profil parolası: `LaunchSpaceDemo2026!`. Bu üretim parolası değildir. Kayıtlı profil, etkinlik kaydı yok: `kayitli@demo.example.org`. Etkinlik kaydı hazır: `hazir@demo.example.org`. Yeni kullanıcı için farklı bir örnek adres kullan.

14 Kasım, Cumartesi, 18.00. Mekân ve etkinliğin son adı henüz belirtilmedi. Başlangıç 18.00, bitiş gün sonu taslak değerdir; kesin program değildir. Duyuru/bilet sayfası veya public katalog kaydı eklenmez.

## Akış

1. Yeni katılımcı: ad/soyad/e-posta → kendini tanıt → katkı/alan → aradığı bağlantı → etkinlik eşleştirme onayı. Gerekli alanlar dışında yapay minimum karakter sınırı yok. AI ve pazarlama varsayılan kapalı. Profilin ve katılımcı kodun gösterilir.
2. Mevcut Notwork profili: gerçek mevcut login handler'ı. Bu etkinliğin kaydı varsa kaldığı yerden devam; yoksa üç etkinlik sorusu doldurulur. Mevcut genel profil yanıtları sessizce etkinlik yanıtı yapılmaz.
3. Match admin başlatana kadar bekler. Admin “Herkes hazır · eşleştir” ile küçük işlem grupları halinde mevcut motoru çalıştırır. Aktif odalar korunur. Uygulamalar arası geçiş grubu dağıtmaz; yalnızca açık “Yeni eşleşme iste” aksiyonu dağıtır. Grup sohbeti mevcut event token/grup üyeliği doğrulamasını kullanır.
4. Anket: admin açar, katılımcı beş soruyu tek tek cevaplar. Tam yanıt, event token ve doğru soru sürümü zorunlu. Kişi başına tek oy; tekrar gönderim idempotent. Cevaplar geldikten sonra sorular değişmez. Demo sıfırlaması onaylı ve sadece seçili demo alanında; canlı cevaplar sıfırlanamaz.
5. Sahne: varsayılan bekleme ekranı. Admin hangi soruyu yayınlarsa yalnızca o sorunun toplu adet/yüzdeleri çıkar. İsim, e-posta, token veya ham kişi yanıtı sahneye gitmez. Soru yayınlamak mevcut katılımcı formunu geçersiz kılmaz. Tam ekran ve mobil/masaüstü görünüm var.

## Veri ve izolasyon

- Gerçek Netlify handler'ları ve kayıt/eşleştirme algoritması çalışır; geliştirme runner'ı SDK yerine izole dosya destekli test store'u kullanır. **Üretim Netlify veya paid AI çağrısı yapılmaz.** Bu canlı Netlify yük testi değildir.
- Yerel demo verisi `.local/launch-space/` altında, gitignore kapsamındadır. Event ID, oturum hash'leri, grup state'i ve anket yanıtları sunucu yeniden başlatıldığında korunur. Sadece örnek bilgi gir.
- Merkezi mimari değişmez: network ve yeni poll modülü `event-network` store'unda `events/{eventId}/{demo|live}/matchlab/…` prefix'i altında. Anket key'i `/poll/state.json`; başka event ve live/demo alanına taşmaz.
- Kişi bazında ballot, küçük/kapalı bir state dokümanında tutulur; sahne başına tek state okuması vardır. En çok 2.000 ballot ve tam 5 soru / soru başına 2–8 seçenek sınırı uygulanır.
- Match ve anket atomik state güncellemeleri üretimde Netlify PostgreSQL `ntw_atomic_state` satır kilidini gerektirir. Yerel test versiyonlu CAS kullanır. Canlıya geçmeden bu bağlantı, oturum ve gerçek yük ayrıca doğrulanmalı; yalnız kredi miktarı süreklilik garantisi değildir.
- 14 Kasım demo registration API’si genel üye aktivasyonu ve pazarlama kaydı oluşturmaz; demo kayıtları etkinlik alanında kalır.
- Yerel runner yalnız 127.0.0.1'e bind olur; backend tanımadığı `/api/` isteklerini üretime forward etmez. Projeden alınan test verileri veya anahtarlar fixture'a konulmaz.

## Kontroller

```sh
node tests/launch-space-integration.mjs
node tests/launch-space-persistence.mjs
node tests/launch-space-browser.mjs
npm run test:event
npx tsc --noEmit
npm run build
```

100 sentetik katılımcı: 33 ayrı üçlü grup + 1 bekleyen; 100 eşzamanlı ballot; admin yetkisi; başka grubun sohbetini okuyamama; rematch'in diğer odayı bozmaması; idempotency; yayın öncesi sonuç gizleme; event/demo/live ayrımı; backend restart sonrası kayıt/token korunumu. Tarayıcı testleri yeni kayıt, iki mevcut profil yolu, uygulama/reload devamlılığı, özel grup chat'i, anket gönderimi, sahne yayını ve genel admin modülünü kapsar. Bu testler gerçek event/üretim performans kabulü yerine geçmez.

## Yayın durumu

Bu istek yerel tasarım/test isteğidir. Canlıya dağıtım yapılmaz. Etkinlik kaydı yerel admin registry'sinde oluşturulur; aynı API sözleşmesi sonraki onaylı geçişte gerçek merkezi registry'ye uygulanabilir. Sorular taslaktır; admin üzerinden yanıt başlamadan düzenlenebilir. Mevcut linkler değişmez.

## 9 Kasım — çevrimiçi demo yayını

Kullanıcının canlıya alma isteğiyle `/launch-space`, `/launch-space-kontrol` ve `/launch-space-sahne` demo namespace ile yayınlanır. 14 Kasım demo kayıtlarında merkezi üyelik aktivasyonu, pazarlama kaydı ve AI izinleri sunucuda kapalıdır. Katılımcı tokenları yalnızca bu etkinliğe aittir. Çevrimiçi admin mevcut site admin şifresini kullanır; yerel örnek admin şifresi üretimde geçerli değildir. Mevcut gerçek Notwork profiliyle giriş kendi oturumunu kullanabilir; demo katılımı genel üyeliği değiştirmez. Demo kullanıcı kayıtları Nodes hesabı oluşturmaz. Yerel çalıştırma ve test komutları korunur.
