# Demo ve canlı veri ortamları

Yeni etkinlik sistemleri Netlify Blobs üzerinde birbirinden ayrılmış demo ve canlı veri alanları kullanır. Ortam seçimi yalnızca ilgili environment variable değiştirilerek yapılır; veri otomatik olarak bir ortamdan diğerine kopyalanmaz.

## Demo ortamı

```dotenv
EVENT_NETWORK_DATASET=21agustos-demo
WORDCLOUD_DATASET=21agustos-demo
FIVE_DATABASE=demo
MEMBER_PROFILE_DATABASE=demo
EVENT_REVIEW_DATABASE=demo
```

Bu ayarlar aşağıdaki veri alanlarını kullanır:

- Match Lab: `event-network / events/21agustos-demo/network`
- WordCloud: `event-wordcloud / events/21agustos-demo/wordcloud`
- ntw.five: `ntw-five / events/five-demo/ntw-five-pilot`
- Üye profilleri: `notwork-member-profiles-demo`
- Profil networking kaynağı: `networking-members-demo`
- Etkinlik yorumları: `event-reviews-demo`

## Canlı ortam

```dotenv
EVENT_NETWORK_DATASET=21agustoscanli
WORDCLOUD_DATASET=21agustoscanli
FIVE_DATABASE=live
MEMBER_PROFILE_DATABASE=live
EVENT_REVIEW_DATABASE=live
```

Bu ayarlar mevcut canlı veriyi koruyan alanları kullanır:

- Match Lab: `event-network / events/21agustoscanli/network`
- WordCloud: `event-wordcloud / events/21agustoscanli/wordcloud`
- ntw.five: `ntw-five / events/five-live/ntw-five-pilot`
- Üye profilleri: `notwork-member-profiles`
- Profil networking kaynağı: `networking-members`
- Etkinlik yorumları: `event-reviews`

## İzole lokal test

Aynı anda birden fazla lokal senaryo çalıştırırken doğrudan özel test adları verilebilir:

```dotenv
FIVE_DATASET=five-e2e
MEMBER_PROFILE_STORE=notwork-member-profiles-e2e
MEMBER_SOURCE_STORE=networking-members-e2e
EVENT_REVIEW_STORE=event-reviews-e2e
```

Doğrudan verilen `*_STORE` ve `*_DATASET` değerleri demo/canlı seçiminden önceliklidir. Canlıya geçmeden önce Netlify ortam değişkenlerinin beş sistem için de canlı değerleri gösterdiği kontrol edilmelidir.
