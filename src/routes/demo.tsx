import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Maximize2,
  MessageCircle,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Send,
  Smartphone,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import "../match-demo.css";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "notwork match · interaktif demo" },
      {
        name: "description",
        content:
          "Kaydol, grubunu bul, tanış. Notwork Match deneyimini örnek kullanıcılarla keşfet.",
      },
    ],
  }),
  component: MatchDemo,
});

const steps = [
  { title: "Katıl", caption: "Kendini tanıt, ne aradığını paylaş.", duration: 7 },
  {
    title: "Hazırlan",
    caption: "Kaydın korunur. Etkinlik ekibi başlattığında eşleşirsin.",
    duration: 5,
  },
  { title: "Eşleş", caption: "Birbirini tamamlayan deneyimler aynı grupta.", duration: 14 },
  { title: "Tanış", caption: "Grubuna özel sohbette buluşma noktanızı belirleyin.", duration: 10 },
  { title: "Anı bırak", caption: "Bir fotoğraf, bir fikir. Sonra yeni bağlantılar.", duration: 7 },
];
const groups = [
  {
    name: "Birlikte üretenler",
    people: [
      {
        name: "Deniz",
        role: "Ürün tasarımcısı",
        skill: "Fikirleri görünür kılar",
        code: "D04",
        color: "#347fde",
      },
      {
        name: "Ece",
        role: "Yazılım geliştirici",
        skill: "Prototipleri hayata geçirir",
        code: "E12",
        color: "#af67bf",
      },
      {
        name: "Mert",
        role: "Girişimci",
        skill: "Yeni iş birlikleri arar",
        code: "M08",
        color: "#d28d45",
      },
    ],
    insight:
      "Deniz’in tasarım deneyimi ve Ece’nin yazılım bilgisi, Mert’in fikrini birlikte ilk prototipe dönüştürebilir.",
    question: "Birlikte bir şey üretseydiniz ilk adımınız ne olurdu?",
  },
  {
    name: "Fikrin peşindekiler",
    people: [
      {
        name: "Selin",
        role: "İçerik üreticisi",
        skill: "Hikâyeleri insanlarla buluşturur",
        code: "S16",
        color: "#c36e79",
      },
      {
        name: "Can",
        role: "Marka stratejisti",
        skill: "Fikirlere yön verir",
        code: "C21",
        color: "#648bc9",
      },
      {
        name: "Ada",
        role: "Fotoğrafçı",
        skill: "Özgün görsel dünyalar kurar",
        code: "A09",
        color: "#659787",
      },
    ],
    insight:
      "Selin’in anlatıcılığı, Can’ın marka yaklaşımı ve Ada’nın görsel dili yeni bir içerik serisine dönüşebilir.",
    question: "Bugün seni heyecanlandıran bir fikri bizimle paylaşır mısın?",
  },
  {
    name: "Yeni yol açanlar",
    people: [
      {
        name: "Arda",
        role: "Sosyal girişimci",
        skill: "Toplumsal çözümler geliştirir",
        code: "A32",
        color: "#8b78bc",
      },
      {
        name: "İpek",
        role: "Araştırmacı",
        skill: "İhtiyaçları veriye dönüştürür",
        code: "İ07",
        color: "#4d95af",
      },
      {
        name: "Bora",
        role: "Topluluk kurucusu",
        skill: "Doğru insanları bir araya getirir",
        code: "B18",
        color: "#c18e59",
      },
    ],
    insight:
      "Arda’nın çözüm arayışı, İpek’in araştırmaları ve Bora’nın topluluk deneyimi ortak bir pilot proje başlatabilir.",
    question: "Çevrende değişmesini istediğin küçük bir şey ne?",
  },
];
const cycleLength = steps.reduce((sum, step) => sum + step.duration, 0);

function MatchDemo() {
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [offer, setOffer] = useState("");
  const [need, setNeed] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const round = Math.floor(clock / cycleLength);
  const group = groups[round % groups.length];
  let elapsed = clock % cycleLength;
  let phase = 0;
  while (elapsed >= steps[phase].duration) {
    elapsed -= steps[phase].duration;
    phase++;
  }
  const ownName = firstName.trim() || group.people[0].name;
  const people = group.people.map((person, index) =>
    index ? person : { ...person, name: ownName },
  );
  const [target, setTarget] = useState(1);
  const selected = people[target];
  const distance = Math.max(
    1.2,
    12.4 - Math.max(0, (clock % cycleLength) - 12) * 0.53 + (target === 2 ? 2.1 : 0),
  );

  useEffect(() => {
    setReady(true);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing || enlarged) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setClock((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, enlarged]);
  useEffect(() => {
    setMessages([]);
    setPhoto(false);
    setTarget(1);
  }, [round]);

  const go = (index: number) => {
    setClock(
      round * cycleLength + steps.slice(0, index).reduce((sum, step) => sum + step.duration, 0),
    );
    setPlaying(false);
  };
  const nextGroup = () => {
    setClock((round + 1) * cycleLength + 12);
    setPlaying(false);
  };

  return (
    <main className="ntw-demo" data-testid="match-demo">
      <header className="demo-header">
        <a className="demo-wordmark" href="/" aria-label="Notwork ana sayfa">
          notwork<span>match</span>
          <small>beta v3.0</small>
        </a>
        <span className="demo-live">
          <i /> İnteraktif demo
        </span>
      </header>
      <section className="demo-intro">
        <div>
          <p className="demo-eyebrow">BİR EKRANDAN GERÇEK BAĞLANTILARA</p>
          <h1>Tanışmanın yeni hâli.</h1>
          <p>Bir dokunuşla deneyimle. Gerisini birlikte keşfedelim.</p>
        </div>
        <div className="demo-orientation">
          <Smartphone size={22} />
          <span>
            Telefonunu yatay çevir
            <br />
            <strong>Daha geniş bir bakış.</strong>
          </span>
        </div>
      </section>
      <section className="demo-device" aria-label="Match uygulama demosu">
        <div className="demo-toolbar">
          <span>
            <i /> notwork sahne <b>· örnek etkinlik</b>
          </span>
          <span>
            Tur {round + 1} <span className="demo-toolbar-separator">/</span> {steps[phase].title}
          </span>
        </div>
        <div className="demo-layout">
          <section className="demo-stage" key={`${round}-${phase}`} data-phase={phase}>
            {phase === 0 && (
              <div className="demo-entry">
                <span className="demo-pill">01 / Başlangıç</span>
                <h2>Önce seni tanıyalım.</h2>
                <p>İyi bağlantılar, kendini anlatmakla başlar.</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    go(1);
                  }}
                >
                  <label>
                    Adın
                    <input
                      maxLength={24}
                      value={firstName}
                      disabled={!ready}
                      placeholder={group.people[0].name}
                      onFocus={() => setPlaying(false)}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </label>
                  <div className="demo-form-row">
                    <label>
                      Ne sunabilirsin?
                      <input
                        maxLength={100}
                        value={offer}
                        disabled={!ready}
                        placeholder="Ürün tasarımı"
                        onFocus={() => setPlaying(false)}
                        onChange={(event) => setOffer(event.target.value)}
                      />
                    </label>
                    <label>
                      Ne arıyorsun?
                      <input
                        maxLength={100}
                        value={need}
                        disabled={!ready}
                        placeholder="Birlikte üretecek insanlar"
                        onFocus={() => setPlaying(false)}
                        onChange={(event) => setNeed(event.target.value)}
                      />
                    </label>
                  </div>
                  <button className="demo-primary">
                    Demoya katıl <ArrowRight size={17} />
                  </button>
                </form>
                <small>Örnek form · hesap açılmaz, bilgiler kaydedilmez.</small>
              </div>
            )}
            {phase === 1 && (
              <div className="demo-waiting">
                <div className="demo-waiting-orbit" aria-hidden="true">
                  <Users size={42} />
                  <i />
                  <i />
                </div>
                <span className="demo-pill">02 / Bekleme havuzu</span>
                <h2>Yerini aldın, {ownName}.</h2>
                <p>
                  Herkes hazır olduğunda etkinlik ekibi eşleştirmeyi başlatır. Bu sırada kaydın
                  güvende.
                </p>
                <button className="demo-primary" onClick={() => go(2)}>
                  Örnek eşleşmeyi göster <ArrowRight size={17} />
                </button>
              </div>
            )}
            {phase >= 2 && (
              <>
                <div className="demo-group-title">
                  <div>
                    <p className="demo-eyebrow">
                      {phase === 2
                        ? "GRUBUN HAZIR"
                        : phase === 3
                          ? "SOHBETİNİZ BAŞLASIN"
                          : "BU TANIŞMA BURADA KALMASIN"}
                    </p>
                    <h2>{group.name}</h2>
                  </div>
                  <button
                    className="demo-icon-button"
                    aria-label="Grup adını büyüt"
                    onClick={() => setEnlarged(true)}
                  >
                    <Maximize2 size={19} />
                  </button>
                </div>
                {phase === 2 && (
                  <>
                    <div className="demo-members">
                      {people.map((person, index) => (
                        <article key={person.code} className="demo-person">
                          <div className="demo-avatar" style={{ background: person.color }}>
                            <span>{person.name.slice(0, 1).toLocaleUpperCase("tr")}</span>
                            <i>{index === 0 ? "Sen" : <Check size={12} />}</i>
                          </div>
                          <h3>{person.name}</h3>
                          <p>{person.role}</p>
                          <small>{person.code}</small>
                          <span className="demo-skill">
                            {index === 0 && offer ? offer : person.skill}
                          </span>
                        </article>
                      ))}
                    </div>
                    <div className="demo-analysis">
                      <Sparkles size={17} />
                      <div>
                        <strong>
                          ntw ai <small>örnek analiz</small>
                        </strong>
                        <p>
                          {firstName || offer || need
                            ? `${ownName}, farklı deneyimleri olan grubunla ${need || "yeni fikirler"} üzerine konuşabilir, ${offer || "kendi deneyimin"} ile katkı sunabilirsin.`
                            : group.insight}
                        </p>
                      </div>
                    </div>
                    <div className="demo-actions">
                      <button className="demo-primary" onClick={() => go(3)}>
                        <MessageCircle size={17} /> Grup sohbeti
                      </button>
                      <button className="demo-secondary" onClick={nextGroup}>
                        Yeni eşleşme <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
                {phase === 3 && (
                  <div className="demo-chat">
                    <p className="demo-chat-label">
                      <Users size={14} /> Yalnızca bu grubun sohbeti · demo
                    </p>
                    <div className="demo-chat-messages" role="log" aria-label="Örnek grup sohbeti">
                      <div className="demo-bubble">
                        <small>{people[1].name}</small>Selam! Sahnenin sağındaki masada buluşalım
                        mı?
                      </div>
                      <div className="demo-bubble">
                        <small>{people[2].name}</small>Harika, geliyorum 👋
                      </div>
                      {messages.map((text, index) => (
                        <div className="demo-bubble is-self" key={index}>
                          <small>{ownName}</small>
                          {text}
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!message.trim()) return;
                        setMessages((items) => [...items.slice(-4), message.trim()]);
                        setMessage("");
                        setPlaying(false);
                      }}
                    >
                      <input
                        aria-label="Grubuna örnek mesaj yaz"
                        maxLength={200}
                        value={message}
                        onFocus={() => setPlaying(false)}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Ben de geliyorum…"
                      />
                      <button
                        className="demo-icon-button"
                        aria-label="Mesaj gönder"
                        disabled={!message.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </form>
                    <div className="demo-icebreaker">
                      <Sparkles size={14} />
                      <p>{group.question}</p>
                    </div>
                    <button className="demo-secondary" onClick={() => go(4)}>
                      Anı bırak <Camera size={16} />
                    </button>
                  </div>
                )}
                {phase === 4 && (
                  <div className="demo-memory">
                    <div className={`demo-photo ${photo ? "is-captured" : ""}`}>
                      <div>
                        {people.map((person) => (
                          <span key={person.code} style={{ background: person.color }}>
                            {person.name.slice(0, 1)}
                          </span>
                        ))}
                      </div>
                      <small>
                        {photo
                          ? "Birlikte güzel bir başlangıç."
                          : "Bu karede yeni bağlantılar var."}
                      </small>
                      <Camera size={25} />
                    </div>
                    <p>
                      {photo
                        ? "Örnek anınız hazır. Yeni insanlarla tanışmaya devam!"
                        : `${ownName}, bu turun fotoğrafçısı sensin. Grubunuzla bir anı bırakın.`}
                    </p>
                    <button
                      className="demo-primary"
                      onClick={() => (photo ? nextGroup() : setPhoto(true))}
                    >
                      {photo ? "Yeni gruba geç" : "Örnek kareyi oluştur"}
                      {photo ? <ArrowRight size={17} /> : <Camera size={17} />}
                    </button>
                    <small>Kamera açılmaz · gerçek fotoğraf yüklenmez.</small>
                  </div>
                )}
              </>
            )}
          </section>
          <aside className="demo-proximity" aria-label="Simüle edilmiş üye yakınlığı">
            <div className="demo-proximity-title">
              <span>
                <Navigation size={15} /> Grubunu bul
              </span>
              <small>SİMÜLASYON</small>
            </div>
            {phase < 2 ? (
              <div className="demo-proximity-empty">
                <div className="demo-radar-static">
                  <Users size={28} />
                </div>
                <h3>Birazdan buradasınız.</h3>
                <p>Eşleştiğinde grup üyelerini ve örnek yakınlık görünümünü burada keşfet.</p>
              </div>
            ) : (
              <>
                <div className="demo-targets">
                  {people.slice(1).map((person, index) => (
                    <button
                      key={person.code}
                      aria-pressed={target === index + 1}
                      onClick={() => setTarget(index + 1)}
                    >
                      {person.name}
                    </button>
                  ))}
                </div>
                <div className="demo-radar">
                  <div className="demo-radar-ring" />
                  <div className="demo-radar-ring is-inner" />
                  <div
                    className="demo-radar-arrow"
                    style={{
                      transform: `rotate(${target === 1 ? 30 - Math.min(elapsed, 12) : -35 + Math.min(elapsed, 12)}deg)`,
                    }}
                  >
                    <ArrowDown size={68} strokeWidth={2.5} />
                  </div>
                  <span className="demo-radar-dot" />
                </div>
                <div className="demo-distance">
                  <strong>
                    {distance.toLocaleString("tr-TR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    <small>m</small>
                  </strong>
                  <p>
                    {selected.name} ·{" "}
                    {distance < 3 ? "hemen yakınında" : target === 1 ? "sağ önünde" : "sol önünde"}
                  </p>
                </div>
              </>
            )}
            <p className="demo-location-note">
              Konsept önizlemesi. Mesafe ve yönler örnektir; gerçek konum izlenmez.
            </p>
          </aside>
        </div>
        <footer className="demo-controls">
          <div className="demo-playback">
            <button
              aria-label={playing ? "Otomatik turu durdur" : "Otomatik turu oynat"}
              disabled={!ready}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              aria-label="Demoyu başa al"
              onClick={() => {
                setClock(0);
                setMessages([]);
                setPhoto(false);
                setPlaying(!reducedMotion);
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <nav aria-label="Demo adımları">
            {steps.map((step, index) => (
              <button
                key={step.title}
                aria-current={phase === index ? "step" : undefined}
                onClick={() => go(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.title}
              </button>
            ))}
          </nav>
          <button
            className="demo-next"
            aria-label="Sonraki demo adımı"
            onClick={() => (phase < 4 ? go(phase + 1) : nextGroup())}
          >
            <ChevronRight size={19} />
          </button>
        </footer>
        <div
          className="demo-progress"
          role="progressbar"
          aria-label="Demo turu"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(((clock % cycleLength) / cycleLength) * 100)}
        >
          <span style={{ width: `${((clock % cycleLength) / cycleLength) * 100}%` }} />
        </div>
      </section>
      <div className="demo-caption">
        <p>
          <b>{String(phase + 1).padStart(2, "0")}</b> {steps[phase].caption}
        </p>
        <span>Tüm kişiler ve konuşmalar örnektir.</span>
      </div>
      {enlarged && <GroupName name={group.name} close={() => setEnlarged(false)} />}
    </main>
  );
}

function GroupName({ name, close }: { name: string; close: () => void }) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);
  return (
    <dialog open className="demo-name-overlay" aria-label="Grup adın">
      <span>notwork match</span>
      <h2>{name}</h2>
      <button autoFocus onClick={close}>
        <X size={20} /> Kapat
      </button>
    </dialog>
  );
}
