# notwork etkinlik platformu

Bu belge, MatchLab, WordCloud ve ntw.five ürünlerinin birden fazla etkinlikte veri karışmadan kullanılacağı etkinlik registry modelini tanımlar.

## Temel model

- Her etkinlik değişmeyen bir `event.id` ve kullanıcıya gösterilen bir `event.slug` taşır.
- Etkinlikler `draft`, `scheduled`, `live`, `completed` veya `archived` durumundadır.
- MatchLab, WordCloud ve ntw.five her etkinlikte ayrı ayrı açılıp kapatılır.
- Her ürün için `demo` ve `live` veri alanları birbirinden ayrıdır.
- Bir etkinliği arşivlemek verisini silmez.
- Etkinlik ayarı güncellenirken `revision` kontrolü eski bir admin ekranının yeni veriyi ezmesini engeller.

## Veri alanları

Etkinlik kayıtları `notwork-event-registry` Blob store içinde tutulur:

```text
events/{eventId}.json
slugs/{eventSlug}.json
meta/primary-event.json
audit/{timestamp}-{id}.json
```

Ürün veri alanları event registry tarafından şu şekilde hesaplanır:

```text
events/{eventId}/demo/matchlab
events/{eventId}/live/matchlab
events/{eventId}/demo/wordcloud
events/{eventId}/live/wordcloud
events/{eventId}/demo/five
events/{eventId}/live/five
```

Faz 1 registry ve veri sözleşmesini oluşturdu. Faz 2 ile genel admin paneline etkinlik listesi, oluşturma/düzenleme, ürün aktivasyonu, demo/canlı modu, ana etkinlik seçimi ve güvenli arşivleme ekranı eklendi.

Faz 3 ile MatchLab, WordCloud ve ntw.five API'leri etkinlik bağlamına bağlandı. Yeni etkinlikler generic ürün API'lerini ve `event` seçicisini kullanır. Etkinlik seçicisi verilmezse registry içindeki ana etkinlik kullanılır.

```text
GET  /api/events/context?event={eventSlugOrId}
POST /api/event-products/network?event={eventSlugOrId}
POST /api/event-products/wordcloud?event={eventSlugOrId}
GET  /api/event-products/wordcloud/stream?event={eventSlugOrId}
POST /api/event-products/five?event={eventSlugOrId}
```

Katılımcı arayüzleri de aynı seçiciyi URL üzerinden taşır:

```text
/linkler?event=9-ekim-2026
/21-agustos/eslesme?event=9-ekim-2026
/21-agustos/wordcloud?event=9-ekim-2026
/21-agustos/sonuclar?event=9-ekim-2026
/five/live?event=9-ekim-2026
```

21 Ağustos'a ait eski API yolları ve Blob anahtarları geriye uyumluluk için korunur. Bu yollar `event` seçicisi olmadan çağrıldığında mevcut 21 Ağustos verisini kullanmaya devam eder; böylece canlı geçmiş veri yeni namespace'e taşınmadan kaybolmaz veya karışmaz.

WordCloud admin yanıtları veri büyüdüğünde payload sınırına takılmaması için sayfalanır. Sonuç özetleri tüm cevaplardan hesaplanır; cevap listesi varsayılan olarak sınırlı bir pencere döndürür.

## Admin API

`POST /api/admin/events`

Desteklenen işlemler:

- `list`
- `get`
- `create`
- `update`
- `archive`
- `setPrimary`

Silme işlemi yerine arşivleme kullanılır. Böylece geçmiş etkinlik verileri yanlışlıkla kaybedilmez.
