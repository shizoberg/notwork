import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChartNoAxesColumn,
  CircleHelp,
  ClipboardCheck,
  CodeXml,
  List,
  MessageCircle,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { regionalPath, SiteFooter, SiteNav } from "@/components/SiteNav";
import { documentation } from "@/lib/notwork-documentation";
import { createSeo } from "@/lib/seo";
import { notworkOrganizationId } from "@/lib/structured-data";

const paths = { tr: "/dokumantasyon", de: "/de/dokumentation" } as const;
const site = "https://notwork.me";

export function documentationHead(german = false) {
  const language = german ? "de" : "tr";
  const copy = documentation[language];
  const canonical = site + paths[language];
  const seo = createSeo({
    title: copy.title,
    description: copy.description,
    path: paths[language],
    locale: german ? "de_DE" : "tr_TR",
    type: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical,
      name: copy.heading,
      description: copy.description,
      url: canonical,
      inLanguage: language,
      about: { "@id": notworkOrganizationId },
      publisher: { "@id": notworkOrganizationId },
    },
  });
  return {
    ...seo,
    links: [
      ...seo.links,
      { rel: "alternate", hrefLang: "tr", href: site + paths.tr },
      { rel: "alternate", hrefLang: "de", href: site + paths.de },
      { rel: "alternate", hrefLang: "x-default", href: site + paths.tr },
    ],
  };
}

const sectionIcons: Record<string, LucideIcon> = {
  etkinlikler: CalendarDays,
  katilim: UserRound,
  match: Network,
  ai: Sparkles,
  grup: MessageCircle,
  five: Timer,
  "sahne-araclari": ChartNoAxesColumn,
  topluluk: UsersRound,
  veri: ShieldCheck,
  yonetim: SlidersHorizontal,
  mimari: CodeXml,
  nodes: Network,
  sorular: CircleHelp,
};

const journeyIcons = [CalendarDays, ClipboardCheck, Network, MessageCircle, UsersRound];

const nodesScreens = [
  { image: "community", tr: "Toplulukları keşfet", de: "Communitys entdecken" },
  { image: "nodes", tr: "Kendi ağını gör", de: "Das eigene Netzwerk sehen" },
  { image: "profile", tr: "Üye profili ve QR kodu", de: "Mitgliedsprofil und QR-Code" },
] as const;

function NodesPreview({ german }: { german: boolean }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#33455e] bg-[#19283b] p-4 sm:p-6">
      <p className="max-w-prose text-sm leading-relaxed text-[#c3d0df]">
        {german
          ? "Nodes verbindet Community-Bereiche, Mitglieder und Eventteilnahme. Die Screenshots zeigen die Web-Demo mit Beispieldaten."
          : "Nodes, topluluk alanlarını, üye keşfini ve etkinliğe katılımı bir araya getirir. Aşağıdaki ekranlar web demosundan örnek verilerle alındı."}
      </p>
      <div className="mt-5 grid auto-cols-[min(72%,13rem)] grid-flow-col snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {nodesScreens.map((screen) => {
          const caption = german ? screen.de : screen.tr;
          return (
            <figure
              key={screen.image}
              className="min-w-0 snap-start rounded-xl bg-[#111d2d] p-2 sm:p-3"
            >
              <a
                href={`/documentation/nodes/${screen.image}.webp`}
                className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9d4ff]"
              >
                <img
                  src={`/documentation/nodes/${screen.image}.webp`}
                  alt={german ? `Nodes-Demo: ${caption}` : `Nodes demosu: ${caption}`}
                  width={804}
                  height={1704}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded-lg bg-[#101014]"
                />
              </a>
              <figcaption className="mt-2 text-xs font-semibold text-[#dce9f8] sm:text-sm">
                {caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <a
        href="https://nodes-app.com/"
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#9dcaff] px-4 py-2 text-sm font-bold text-[#14233a] hover:bg-[#dce9f8]"
      >
        {german ? "Nodes-Website öffnen" : "Nodes sitesini aç"} <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export function NotworkDocumentation({ german = false }: { german?: boolean } = {}) {
  const copy = documentation[german ? "de" : "tr"];

  const sectionLinks = (
    <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
      {copy.sections.map((section) => {
        const Icon = sectionIcons[section.id] ?? List;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-snug text-[#b1d7ff] hover:bg-[#283e58] hover:underline"
            >
              <Icon
                size={15}
                strokeWidth={1.6}
                className="shrink-0 text-[#90b9e7]"
                aria-hidden="true"
              />
              {section.title}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="notwork-documentation min-h-screen bg-[#101a29] text-[#f0f5fc]">
      <SiteNav german={german} />
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-5 sm:pb-16 sm:pt-8">
        <header className="border-b border-[#344258] pb-6 sm:pb-8">
          <div className="isolate [display:grid] grid-cols-1 sm:grid-rows-[auto_1fr]">
            <div className="relative col-start-1 row-start-1 min-h-[18rem] overflow-hidden rounded-2xl border border-[#344258] bg-[#152237] sm:row-end-3 sm:min-h-[23rem] sm:rounded-3xl">
              <img
                src="/community/25.jpg"
                alt=""
                width={1080}
                height={1350}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-[center_54%] sm:object-[center_65%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,#0b1528e6_0%,#0b1528a6_25%,#0b152800_56%)] sm:bg-[linear-gradient(95deg,#0b1528ed_0%,#0b1528c7_37%,#0b152800_74%)]"
              />
            </div>
            <h1 className="relative col-start-1 row-start-1 max-w-3xl self-start text-balance break-words px-4 pt-5 font-display text-[clamp(1.85rem,7vw,3.65rem)] font-black leading-[1.02] tracking-tight text-white sm:px-9 sm:pt-10">
              {copy.heading}
            </h1>
            <p className="relative col-start-1 row-start-2 mt-4 max-w-xl text-sm leading-relaxed text-[#c3d0df] sm:px-9 sm:pb-10 sm:text-lg sm:text-[#e4edf8]">
              {copy.lead}
            </p>
          </div>
          <ol
            aria-label={copy.journeyLabel}
            className="mt-4 [display:grid] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#344258] bg-[#344258] sm:mt-6 md:grid-cols-5"
          >
            {copy.journey.map((step, index) => {
              const Icon = journeyIcons[index];
              return (
                <li
                  key={step}
                  className="flex items-center gap-2 bg-[#172438] px-3 py-3 text-xs font-semibold sm:text-sm"
                >
                  <Icon
                    size={17}
                    strokeWidth={1.6}
                    className="shrink-0 text-[#b1d7ff]"
                    aria-hidden="true"
                  />
                  {step}
                </li>
              );
            })}
          </ol>
        </header>
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <details className="rounded-2xl border border-[#344258] bg-[#1a293e] p-3 lg:hidden">
            <summary className="min-h-10 cursor-pointer px-2 py-2 text-sm font-bold text-[#f0f5fc]">
              {copy.contents}
            </summary>
            {sectionLinks}
          </details>
          <nav
            aria-label={copy.contents}
            className="hidden rounded-2xl border border-[#344258] bg-[#1a293e] p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto"
          >
            <h2 className="mb-2 font-mono text-sm font-bold">{copy.contents}</h2>
            {sectionLinks}
          </nav>
          <article className="min-w-0">
            {copy.sections.map((section) => {
              const Icon = sectionIcons[section.id] ?? List;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 border-b border-[#344258] py-7 first:pt-0 sm:py-8"
                >
                  <h2 className="flex items-start gap-2.5 font-display text-2xl font-black tracking-tight sm:text-3xl">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#233852] text-[#b1d7ff] sm:size-9">
                      <Icon size={18} strokeWidth={1.65} aria-hidden="true" />
                    </span>
                    <span>{section.title}</span>
                  </h2>
                  {section.id === "nodes" && <NodesPreview german={german} />}
                  {section.summary && (
                    <p className="mt-4 leading-relaxed text-[#bfccdc]">{section.summary}</p>
                  )}
                  {section.entries && (
                    <dl className="mt-5 divide-y divide-[#344258] rounded-2xl border border-[#344258] bg-[#172438]">
                      {section.entries.map(([label, description]) => (
                        <div
                          key={label}
                          className="grid gap-1 p-3 sm:p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
                        >
                          <dt className="text-sm font-bold text-[#f0f5fc]">{label}</dt>
                          <dd className="text-sm leading-relaxed text-[#bfccdc]">{description}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {section.link && (
                    <Link
                      className="mt-4 inline-block font-bold text-[#b1d7ff] underline underline-offset-4"
                      to={regionalPath(section.link[0], german)}
                    >
                      {section.link[1]}
                    </Link>
                  )}
                  {section.faq?.map(([question, answer]) => (
                    <div key={question} className="mt-5">
                      <h3 className="font-bold">{question}</h3>
                      <p className="mt-1 leading-relaxed text-[#bfccdc]">{answer}</p>
                    </div>
                  ))}
                </section>
              );
            })}
          </article>
        </div>
      </main>
      <SiteFooter german={german} />
    </div>
  );
}
