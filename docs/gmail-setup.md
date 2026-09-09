# Notwork Gmail gönderimi

Gönderen yalnızca `berk@notwork.me`. Resend kullanılmaz. Gmail OAuth yetkileri `openid email gmail.send` ile sınırlıdır; gelen kutusu okunmaz.

## Google Cloud

1. Notwork Gmail projesinde Gmail API'yi etkinleştir.
2. OAuth uygulamasını Notwork olarak yapılandır. Kullanıcı destek ve geliştirici iletişim adresi `berk@notwork.me`. Workspace organizasyonu uygunsa Internal uygulama kullan; External gerekiyorsa Google'ın yayın/doğrulama gereksinimlerini tamamla. External Testing modundaki refresh token süresi sınırlı olabilir; kalıcı otomasyon için yayın durumunu doğrula.
3. Web application türünde OAuth client oluştur. Tek yönlendirme URI'si:
   `https://notwork.me/api/admin/gmail/callback`
4. `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini Netlify notworkweb Production / Functions ortamına kaydet. Secret değerini gizli işaretle. Kod veya sohbet içine kopyalama.
5. `GMAIL_TOKEN_ENCRYPTION_KEY` 32 rastgele baytın base64 kodlamasıdır. Netlify Production / Functions içinde gizli saklanır. Kaybedilir/değiştirilirse Gmail bağlantısı yeniden kurulmalıdır.

## İşleyiş

- Admin → Profiller → 17 Eylül duyurusu → Google hesabını bağla. OAuth state hem HttpOnly SameSite çerezi hem sunucu kaydıyla doğrulanır, tek kullanımlı ve 10 dakika geçerlidir. PKCE kullanılır.
- Refresh token yalnızca sunucu blob deposunda AES-256-GCM ile şifrelenmiş tutulur. API yanıtlarına, istemciye veya loglara yazılmaz.
- Bağlantıdan sonra admin üzerinden `berk@carewithki.com` adresine test yapılır. Test alıcısı sunucuda sabittir ve kapatılmışsa gönderilmez.
- Yeni olumlu form tercihi, hesap bağlıysa reklamsız e-posta doğrulamasını başlatır. Aynı adrese UTC gün başına en fazla bir doğrulama isteği işlenir. Bağlantı 24 saat geçerlidir. GET yalnızca sayfayı açar, POST doğrular. Kapatılmış adres doğrulama yoluyla tekrar açılmaz.
- Gönderim başlangıcında kampanya içeriği ve izinli alıcıları sabitlenir. İzinler gönderim öncesinde yeniden denetlenir. İsimler kişinin ilk adından doldurulur; her mesajın yalnızca bir To alıcısı vardır.
- Admin ekranı beşli gruplarla ilerler. Ekran kapatılırsa aynı kampanya devam ettirilebilir. Devam eden HTTP isteğindeki grup tamamlanabilir; durdurma sonraki grupları engeller.
- Her kampanya/alıcı işlemine atomik `onlyIfNew` kayıt ayrılır. Gmail'de send idempotency API'si olmadığı için belirsiz/başarısız gönderimler otomatik tekrarlanmaz. Hata satırı oluşursa otomatik ilerleme durur. Sunucu outbox kaydı ve Gmail Sent klasörü incelenmeden kayıt silinmemelidir.
- Gmail API'nin kabulü teslim edildi veya okundu demek değildir. Gelen kutusunu okuma yetkisi alınmadığı için bounce/spam geri bildirimleri otomatik okunmaz; Gmail üzerinden takip edilir. Teslim edilemeyen veya şikâyet eden adresler admin tarafından gönderime kapatılmalıdır.
- Uygulama sınırı `GMAIL_DAILY_LIMIT` (varsayılan 100; en çok 500) mesaj / UTC gündür; test ve doğrulama mesajları dahildir. Bu, Google'ın hesap limitinin yerine geçmez. Sınır dolunca gönderim durur; sonraki gün admin üzerinden devam edilir.
- İYS ve yurt dışı aktarım yükümlülükleri ayrıca değerlendirilir. OAuth bağlantısı hukuki uygunluk sertifikası değildir.

## Devreye alma kontrolü

Kod testleri Google cevaplarını taklit eder, gerçek Gmail teslimatı kanıtı değildir. Canlı OAuth dönüşü, test mailinin gelen kutusu ve spam kontrolü, Türkçe/ad/HTML görünümü, yanıt adresi ve çıkış bağlantısı doğrulanmadan kampanya başlatılmamalıdır. Eski izni bilinmeyen liste otomatik yükseltilmez.

## Doğrulanmış belgeler

- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/workspace/gmail/api/guides/sending
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
