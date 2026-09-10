import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Clock3, UsersRound, ArrowUpRight, Check } from "lucide-react";

export function EventAppPreview({ kind }: { kind: string }) {
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("pool");
  const match = kind === "matchlab";
  return (
    <div className="event-tool">
      <SiteNav variant="event" />
      <main className="app-preview">
        <span className="tool-eyebrow">Örnek içerik · canlı veri değil</span>
        <h1>{match ? "ntw.matchlab" : kind === "five" ? "ntw.five" : "ntw.wordcloud"}</h1>
        {!match && <p>5 dakikada üretilen çözümler</p>}
        {match ? (
          <section className="tool-surface">
            <UsersRound size={26} />
            <h2>{done ? "Güzel bir başlangıç." : "Tanışacağın kişiler hazır."}</h2>
            <div className="match-orbits">
              {["Sen · C03", "A12", "B07"].map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <p>
              {done
                ? "Bir sonraki tanışmaya hazırsın."
                : "Kodları bul, selam ver. Ortak noktanız: tasarım ve girişim."}
            </p>
            <button className="tool-primary" onClick={() => setDone(!done)}>
              {done ? "Yeni turu dene" : "Tanışmayı tamamladık"}
              <Check size={17} />
            </button>
          </section>
        ) : (
          <>
            <div className="tool-tabs">
              <button aria-pressed={tab === "pool"} onClick={() => setTab("pool")}>
                Sorular
              </button>
              <button aria-pressed={tab === "meeting"} onClick={() => setTab("meeting")}>
                Görüşme
              </button>
            </div>
            {tab === "meeting" ? (
              <section className="tool-surface meeting-minimal">
                <span className="tool-eyebrow">Örnek görüşme</span>
                <h2>{selected || "Birlikte düşünmeye hazır mısın?"}</h2>
                <div className="meeting-clock">05:00</div>
                <p>{done ? "Görüşme tamamlandı" : "Bir soru, ortak bir adım."}</p>
                <button className="tool-primary" onClick={() => setDone(!done)}>
                  {done ? "Yeni görüşme" : "Görüşmeyi tamamla"}
                  <Check size={17} />
                </button>
              </section>
            ) : (
              ["İlk müşterilerime nasıl ulaşırım?", "Fikrimi nasıl test ederim?"].map((title) => (
                <section className="tool-surface" key={title}>
                  <span className="tool-eyebrow">Girişim · örnek soru</span>
                  <h2>{title}</h2>
                  <p>Deneyimini paylaş, birlikte bir adım ilerleyin.</p>
                  <button
                    className="tool-primary"
                    onClick={() => {
                      setSelected(title);
                      setTab("meeting");
                      setDone(false);
                    }}
                  >
                    {selected === title ? "Örnek görüşme hazır" : "Katkı sun"}
                    {selected === title ? <Clock3 size={17} /> : <ArrowUpRight size={17} />}
                  </button>
                </section>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
