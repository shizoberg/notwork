import { useState } from "react";

type InterviewVideo = {
  src: string;
  title: string;
  label?: string;
};

const defaultVideos: InterviewVideo[] = [
  {
    src: "/interviews/21-agustos-roportaj-1.mp4",
    title: "21 Ağustos röportajı 01",
    label: "katılımcı yorumu",
  },
  {
    src: "/interviews/21-agustos-roportaj-2.mp4",
    title: "21 Ağustos röportajı 02",
    label: "etkinlik sonrası",
  },
  {
    src: "/interviews/21-agustos-roportaj-3.mp4",
    title: "21 Ağustos röportajı 03",
    label: "notwork hissi",
  },
  {
    src: "/interviews/21-agustos-roportaj-4.mp4",
    title: "21 Ağustos röportajı 04",
    label: "kısa yorum",
  },
];

export function InterviewReels({
  title = "Sizlerin yorumları",
  eyebrow = "röportajlar",
  description = "Etkinlik sonrası aldığımız kısa yorumlar. Kartlarda sessiz döner; tıklayınca sesli izleyebilirsin.",
  videos = defaultVideos,
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
  videos?: InterviewVideo[];
}) {
  const [activeVideo, setActiveVideo] = useState<InterviewVideo | null>(null);
  const loopVideos = [...videos, ...videos];

  return (
    <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-20 sm:px-5">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
            {eyebrow}
          </div>
          <h2 className="mt-1.5 font-display text-3xl font-black tracking-[-0.04em] sm:mt-2 sm:text-5xl">
            {title}
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[22px] border border-border bg-card/70 p-2.5 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-card to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-card to-transparent" />
        <div className="flex w-max gap-3 interview-reel-track">
          {loopVideos.map((video, index) => (
            <button
              key={`${video.src}-${index}`}
              type="button"
              onClick={() => setActiveVideo(video)}
              className="group relative h-52 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-ink text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 sm:h-72 sm:w-48"
              aria-label={`${video.title} videosunu aç`}
            >
              <video
                src={video.src}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full object-cover opacity-90 transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="mt-1 text-sm font-black text-white">{video.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-ink shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:max-w-md">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-sm font-black text-ink"
            >
              kapat
            </button>
            <video
              src={activeVideo.src}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] w-full bg-black object-contain"
            />
            <div className="bg-card p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
                21 Ağustos etkinlik röportajları
              </div>
              <div className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">
                {activeVideo.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
