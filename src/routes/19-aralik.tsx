import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage, type EventProductConfig } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { eventConfig as fastConfig } from "./10-aralik";

export const eventConfig: EventProductConfig = {
  ...fastConfig,
  trackingId: "notwork-fast-2026-12-19",
  imageSubtitle: "19 aralık · 20.30 · folkart time sosyal sahne",
  date: "19 Aralık 2026",
  day: "Cumartesi",
  time: "20.30",
  venue: "Folkart Time Sosyal Sahne",
  venueUrl: "https://www.google.com/maps/search/?api=1&query=Folkart+Time+Sosyal+Sahne",
  gallery: fastConfig.gallery.filter(item => item.label !== "mekân").map(item => ({
    ...item,
    alt: item.alt.replaceAll("10 Aralık", "19 Aralık"),
    subtitle: item.subtitle?.replaceAll("10 aralık", "19 aralık").replaceAll("20.00", "20.30"),
  })),
  flow: fastConfig.flow.map(step => ({ ...step, time: step.time === "20.00" ? "20.30" : step.time === "21.00" ? "21.30" : step.time === "22.30" ? "23.00" : step.time })),
};
export const Route = createFileRoute("/19-aralik")({
  head: () => createSeo({title:"19 Aralık notwork Fast | Folkart Time Sosyal Sahne",description:"19 Aralık 2026 saat 20.30 · Folkart Time Sosyal Sahne. Match, Five ve DJ ile hızlı networking. Biletini al.",path:"/19-aralik"}),
  component: () => <EventProductPage config={eventConfig} />,
});
