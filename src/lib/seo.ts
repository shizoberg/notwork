import { serializeStructuredData, type StructuredData } from "./structured-data";

const siteUrl = "https://notwork.me";
const defaultImage = `${siteUrl}/notwork-social.png`;
const defaultKeywords = [
  "notwork",
  "notwork İzmir",
  "İzmir network club",
  "İzmir networking",
  "başarısızlık hikâyeleri",
];

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  canonicalPath?: string;
  robots?: string;
  type?: "website" | "article";
  structuredData?: StructuredData;
};

export function createSeo({
  title,
  description,
  path,
  keywords = [],
  image = defaultImage,
  imageAlt = "notwork İzmir network club etkinliğinden katılımcılar",
  canonicalPath,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  type = "website",
  structuredData,
}: SeoOptions) {
  const canonical = `${siteUrl}${canonicalPath ?? path}`;
  const keywordContent = [...new Set([...defaultKeywords, ...keywords])].join(", ");

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: keywordContent },
      { name: "robots", content: robots },
      { property: "og:site_name", content: "notwork" },
      { property: "og:locale", content: "tr_TR" },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1080" },
      { property: "og:image:height", content: "1350" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: structuredData
      ? [
          {
            type: "application/ld+json",
            children: serializeStructuredData(structuredData),
          },
        ]
      : undefined,
  };
}

export function createNoIndexSeo({
  title,
  description,
  path,
  canonicalPath,
}: Pick<SeoOptions, "title" | "description" | "path" | "canonicalPath">) {
  return createSeo({
    title,
    description,
    path,
    canonicalPath,
    robots: "noindex, nofollow, noarchive",
  });
}
