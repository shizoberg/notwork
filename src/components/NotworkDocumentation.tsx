import { Link } from "@tanstack/react-router";
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

export function NotworkDocumentation({ german = false }: { german?: boolean } = {}) {
  const copy = documentation[german ? "de" : "tr"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav german={german} />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:py-16">
        <header className="border-b border-border pb-8">
          <h1 className="max-w-3xl text-balance font-display text-4xl font-black tracking-tight sm:text-6xl">
            {copy.heading}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.lead}
          </p>
          <ol
            aria-label={copy.journeyLabel}
            className="mt-7 grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-card md:grid-cols-5 md:divide-x md:divide-y-0"
          >
            {copy.journey.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 px-4 py-3 text-sm font-semibold">
                <span className="font-mono text-xs text-primary-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </header>
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label={copy.contents}
            className="rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24"
          >
            <h2 className="font-mono text-sm font-bold">{copy.contents}</h2>
            <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {copy.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm leading-snug text-primary-deep hover:bg-primary/10 hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <article>
            {copy.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-b border-border py-8 first:pt-0"
              >
                <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                  {section.title}
                </h2>
                {section.summary && (
                  <p className="mt-4 leading-relaxed text-muted-foreground">{section.summary}</p>
                )}
                {section.entries && (
                  <dl className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
                    {section.entries.map(([label, description]) => (
                      <div
                        key={label}
                        className="grid gap-1 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt className="text-sm font-bold text-foreground">{label}</dt>
                        <dd className="text-sm leading-relaxed text-muted-foreground">
                          {description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.link && (
                  <Link
                    className="mt-4 inline-block font-bold text-primary-deep underline underline-offset-4"
                    to={regionalPath(section.link[0], german)}
                  >
                    {section.link[1]}
                  </Link>
                )}
                {section.faq?.map(([question, answer]) => (
                  <div key={question} className="mt-5">
                    <h3 className="font-bold">{question}</h3>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{answer}</p>
                  </div>
                ))}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter german={german} />
    </div>
  );
}
