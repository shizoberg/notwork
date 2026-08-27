const siteUrl = "https://notwork.me";

export type StructuredData = Record<string, unknown>;

export const notworkOrganizationId = `${siteUrl}/#organization`;

export const notworkSiteStructuredData: StructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": notworkOrganizationId,
      name: "notwork",
      alternateName: ["notwork İzmir", "notwork network club"],
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      image: `${siteUrl}/notwork-social.png`,
      description:
        "İzmir'de başarısızlık hikâyelerini, gerçek deneyimleri ve doğru bağlantıları bir araya getiren network club.",
      areaServed: {
        "@type": "City",
        name: "İzmir",
      },
      sameAs: ["https://www.instagram.com/notwork.ntw/", "https://www.youtube.com/@notwork-izmir"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "community and event inquiries",
        email: "berk@carewithki.com",
        availableLanguage: ["Turkish", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "notwork",
      alternateName: "notwork İzmir Network Club",
      inLanguage: "tr-TR",
      publisher: { "@id": notworkOrganizationId },
    },
  ],
};

type EventStructuredDataOptions = {
  name: string;
  description: string;
  path: string;
  startDate: string;
  endDate: string;
  venueName: string;
  addressLocality: string;
  images: string[];
  ticketUrl: string;
  lowPrice: number;
  highPrice: number;
  videos?: Array<{
    name: string;
    description: string;
    contentUrl: string;
    thumbnailUrl: string;
    uploadDate: string;
  }>;
};

export function createEventStructuredData({
  name,
  description,
  path,
  startDate,
  endDate,
  venueName,
  addressLocality,
  images,
  ticketUrl,
  lowPrice,
  highPrice,
  videos = [],
}: EventStructuredDataOptions): StructuredData {
  const eventUrl = `${siteUrl}${path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        "@id": `${eventUrl}/#event`,
        name,
        description,
        url: eventUrl,
        image: images.map(toAbsoluteUrl),
        startDate,
        endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        inLanguage: "tr-TR",
        location: {
          "@type": "Place",
          name: venueName,
          address: {
            "@type": "PostalAddress",
            addressLocality,
            addressRegion: "İzmir",
            addressCountry: "TR",
          },
        },
        organizer: { "@id": notworkOrganizationId },
        offers: {
          "@type": "AggregateOffer",
          url: ticketUrl,
          priceCurrency: "TRY",
          lowPrice,
          highPrice,
          offerCount: 2,
          availability: "https://schema.org/InStock",
        },
      },
      ...videos.map((video, index) => ({
        "@type": "VideoObject",
        "@id": `${eventUrl}/#video-${index + 1}`,
        name: video.name,
        description: video.description,
        contentUrl: toAbsoluteUrl(video.contentUrl),
        thumbnailUrl: toAbsoluteUrl(video.thumbnailUrl),
        uploadDate: video.uploadDate,
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${eventUrl}/#event` },
        publisher: { "@id": notworkOrganizationId },
      })),
    ],
  };
}

export function serializeStructuredData(data: StructuredData) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function toAbsoluteUrl(value: string) {
  return value.startsWith("http") ? value : `${siteUrl}${value}`;
}
