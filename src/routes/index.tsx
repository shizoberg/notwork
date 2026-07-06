import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import gallery2 from "@/assets/gallery/notwork-2.jpg";
import gallery3 from "@/assets/gallery/notwork-3.jpg";
import gallery4 from "@/assets/gallery/notwork-4.jpg";
import gallery5 from "@/assets/gallery/notwork-5.jpg";
import gallery6 from "@/assets/gallery/notwork-6.jpg";
import gallery8 from "@/assets/gallery/notwork-8.jpg";
import gallery9 from "@/assets/gallery/notwork-9.jpg";
import gallery10 from "@/assets/gallery/notwork-10.jpg";
import gallery12 from "@/assets/gallery/notwork-12.jpg";
import gallery13 from "@/assets/gallery/notwork-13.jpg";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "notwork İzmir | Başarısızlık, Öğrenme ve Networking" },
      { name: "description", content: "notwork, İzmir’de başarısızlıklardan çıkarılan derslerin ve başarıya dönüşen gerçek hikâyelerin paylaşıldığı sahne ve networking etkinliğidir." },
      { name: "keywords", content: "notwork, İzmir etkinlik, networking İzmir, başarısızlık hikâyeleri, girişimcilik etkinliği, Mahal Bomonti" },
      { property: "og:title", content: "notwork İzmir | Uğraşıp da Olduramadıklarının Sahnesi" },
      { property: "og:description", content: "Gerçek başarısızlıkları, çıkarılan dersleri ve başarıya dönüşen hikâyeleri İzmir’de birlikte dinliyoruz." },
      { property: "og:url", content: "https://notwork.me/" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { property: "og:image:width", content: "1080" },
      { property: "og:image:height", content: "1080" },
      { property: "og:image:alt", content: "notwork İzmir etkinliğinden katılımcılar" },
      { name: "twitter:title", content: "notwork İzmir | Uğraşıp da Olduramadıklarının Sahnesi" },
      { name: "twitter:description", content: "Başarısızlıklardan öğrenilenlerin ve başarıya dönüşen gerçek hikâyelerin sahnesi." },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/" }],
  }),
  component: Landing,
});

const gallery = [
  gallery2,
  gallery3,
  gallery4,
  gallery13,
  gallery12,
  gallery10,
  gallery9,
  gallery8,
  gallery6,
  gallery5,
];

const faq = [
  { q: "notwork tam olarak ne?", a: "İzmir'de düzenlenen, sadece deneyip de yapamadıklarımızı değil; bu başarısızlıklardan ne öğrendiğimizi ve nasıl başardığımızı paylaştığımız bir network eventi." },
  { q: "Sahnede kimler var?", a: "Her event 4 konuşmacı ağırlıyor. Her biri 10 dakikada bir deneyimini, çıkardığı dersi ve dönüşümünü sunumla anlatıyor." },
  { q: "Konu akışı nasıl seçiliyor?", a: "Üç kol üzerinden ilerliyoruz: kariyer, ilişki ve macera. Her eventte bu üç perspektiften farklı hayatlar dinliyoruz." },
  { q: "Networking ne zaman?", a: "Sunumlar bittikten sonra. Öncesinde ısınmak için mikrofonu seyirciye uzatıp interaktif bir oyun oynuyoruz." },
  { q: "Ben de sahneye çıkabilir miyim?", a: "Evet. Community sayfasından sunumunu ve hikâyeni gönder, sana WhatsApp'tan dönelim." },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Lesson />
        <Benefits />
        <Tracks />
        <Nedir />
        <Gallery />
        <FAQ />
        <SubmitCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

const tracks = [
  { tag: "KARİYER", desc: "Başarmaya çalışırken arka planda dönenler: olmayan projeler, kaçan fırsatlar, görünmeyen bedeller, yanlış tercihler ve seni dönüştüren süreçler.", color: "#1e3a8a" },
  { tag: "İLİŞKİLER", desc: "İş ilişkileri ve arkadaşlıkta yapılan yanlışlar, yakınlık, kopuş, içte kalan şeyler ve iletişimi yeniden kurmanın yolları.", color: "#8b2c5c" },
  { tag: "MACERA", desc: "Seyahat hikâyeleri, deneyip paylaşamamış veya adım atılamamış farklı maceralar, cesaret edilmemiş yollar.", color: "#e8743b" },
];

function Hero() {
  return (
    <section id="bilet" className="relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-5 pt-6 sm:pt-12 pb-10 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary blink" />
          <span>14 Temmuz 2026</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Mahal Bomonti İzmir</span>
        </div>

        <div className="mx-auto mt-3 h-px w-10 bg-primary" />

        <h1 className="mt-3 font-display font-black tracking-[-0.05em] text-foreground text-balance break-keep text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[0.85]">
          Başarıdan Önce{" "}
          <br />
          <span className="text-primary-deep">Gelen Deneyimler</span>
        </h1>

        <a
          href="https://www.biletimgo.com/etkinlik/notwork-14-temmuz-ugrasip-da-olmayanlar-28473"
          data-analytics="ticket_click"
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Bilet al
        </a>

      </div>
    </section>
  );
}

function Lesson() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5 -mt-2 sm:-mt-4 mb-10 sm:mb-16 text-center">
      <p className="mx-auto max-w-3xl text-foreground/70 text-lg sm:text-2xl md:text-3xl leading-snug font-medium">
        Yapamadıklarımızdan çıkardığımız dersler ile{" "}
        <span className="font-bold text-foreground">nasıl başardık</span>{" "}
        — işte bu hikayeleri dinleyeceksiniz.
      </p>
      <div className="mt-8 sm:mt-10 mx-auto h-px w-16 bg-border" />
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5 pb-6 sm:pb-12">
      <div className="mx-auto max-w-2xl w-full rounded-xl border border-border bg-card p-3 sm:p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-widest">Sana ne katacak?</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { tag: "Doğru Network", desc: "Doğru insanlarla tanışmak." },
            { tag: "Doğru Kişiler", desc: "Senin gibi deneyim paylaşan insanlarla bağ kurmak." },
            { tag: "Başarıya Nasıl Gidilir", desc: "Hataları başarıya çeviren yolları öğrenmek." },
          ].map((b) => (
            <div key={b.tag} className="rounded-lg border border-border bg-background p-2.5">
              <div className="font-display font-bold text-[10px] sm:text-sm tracking-tight text-primary-deep">{b.tag}</div>
              <div className="mt-1 h-px w-5 bg-primary/40" />
              <p className="mt-1.5 text-[10px] sm:text-xs text-foreground/80 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tracks() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5 pb-8 sm:pb-16">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-[0.2em] leading-relaxed">
            UĞRAŞIP YAPAMADILARIMIZI
            <br />
            3 FARKLI AÇIDAN DİNLE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
          {tracks.map((t) => (
            <div
              key={t.tag}
              className="rounded-xl border p-3 sm:p-4"
              style={{ borderColor: `${t.color}30`, backgroundColor: `${t.color}08` }}
            >
              <div className="font-display font-bold text-lg sm:text-2xl tracking-tight" style={{ color: t.color }}>
                {t.tag}
              </div>
              <div className="mt-1.5 h-px w-10 opacity-40" style={{ backgroundColor: t.color }} />
              <p className="mt-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto text-center">
          Her etkinlikte 3–4 konuk. Her gecede en az{" "}
          <span className="font-semibold" style={{ color: "#1e3a8a" }}>1 kariyer</span>,{" "}
          <span className="font-semibold" style={{ color: "#8b2c5c" }}>1 ilişki/iletişim</span> ve{" "}
          <span className="font-semibold" style={{ color: "#e8743b" }}>1 macera</span> hikâyesi.
        </p>
      </div>
    </section>
  );
}

function Nedir() {
  const items = [
    { n: "01", t: "Denedik, olmadı, sonra ne oldu?", d: "Her konuşmacı 10 dakikada deneyip de yapamadığı şeyi anlatır; ama asıl vurgu, bu deneyimden ne öğrendiği ve nasıl başardığı üzerinedir." },
    { n: "02", t: "3 hayat kolu", d: "Kariyer, ilişki ve macera başlıkları altında farklı alanlarda deneyim, başarısızlık, öğrenme ve başarı hikâyeleri dinleriz." },
    { n: "03", t: "Önce ısınma oyunu", d: "Sunumlardan önce mikrofonu seyirci arasında gezdirip interaktif bir oyun oynuyoruz; paylaşmak konusunda ısınıyoruz." },
    { n: "04", t: "Sonra networking", d: "Sunumlar bittiğinde gerçek anlamda tanışma ve sohbet vakti başlıyor; başarısızlık konuşulunca bağlar daha kolay kuruluyor." },
  ];
  return (
    <section id="nedir" className="mx-auto max-w-6xl px-5 mt-20 sm:mt-28">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">Bir notwork eventinde</div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground max-w-2xl">Seni ne bekliyor?</h2>
        </div>
        <p className="text-muted-foreground max-w-md">
          Başarı hikâyelerinden yorulduysan doğru yerdesin. Burada konuşulan sadece denedik ve olmadı değil; bu başarısızlıklardan ne öğrendiğimiz ve nasıl başardığımız.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((i) => (
          <div key={i.n} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-[var(--shadow-card)] transition">
            <div className="font-display text-primary text-3xl font-bold">{i.n}</div>
            <div className="mt-3 font-display font-semibold text-lg">{i.t}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  const loop = [...gallery, ...gallery];
  return (
    <section id="galeri" className="mt-20 sm:mt-28">
      <div className="mx-auto max-w-6xl px-5 mb-8">
        <h2 className="font-display font-bold text-2xl sm:text-4xl">Önceki eventlerden</h2>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex gap-4 w-max marquee-track">
          {loop.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`notwork event anı ${i + 1}`}
              loading="lazy"
              width={1024}
              height={1024}
              className="h-56 sm:h-72 w-auto rounded-2xl object-cover shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="mx-auto max-w-3xl px-5 mt-20 sm:mt-28">
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-center">Sık sorulanlar</h2>
      <p className="mt-3 text-center text-muted-foreground">Aklında kalan her şey, hızlıca.</p>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {faq.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <button type="button" onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 sm:px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-display font-semibold text-base sm:text-lg">{q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary-deep flex items-center justify-center font-bold transition-transform ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </div>
      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden text-muted-foreground leading-relaxed">{a}</div>
      </div>
    </button>
  );
}

function SubmitCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 mt-20 sm:mt-28">
      <div className="relative overflow-hidden rounded-3xl bg-ink text-cream p-8 sm:p-14">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: "var(--primary)" }} />
        <div className="relative max-w-2xl">
          <div className="text-primary font-medium uppercase tracking-widest text-sm">Sahneye çık</div>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-5xl leading-tight">
            Denedin, olmadı, sonra öğrendin ve başardın. Şimdi anlatma zamanı.
          </h2>
          <p className="mt-4 text-cream/75 max-w-lg">
            Sunumunu yükle, hikâyeni ve bu deneyimden çıkardığın dersi birkaç cümleyle anlat. WhatsApp üzerinden sana hızlıca dönüyoruz.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link to="/community" className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
              Sunumu gönder →
            </Link>
            <a href="https://wa.me/905457210929?text=Merhaba%20notwork%2C%20etkinlik%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-cream/30 text-cream font-medium hover:bg-cream/10 transition">
              WhatsApp mesajı gönder
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
