import type { EventDataMode } from "./event-registry";

export type LaunchDataset = {
  id: string;
  name: string;
  mode: EventDataMode;
  createdAt: string | null;
};

export type LaunchAnnouncement = { id: string; text: string; publishedAt: string };
export type LaunchBulletin = {
  announcement: LaunchAnnouncement | null;
  vote: { version: number; title: string } | null;
};
export type ActiveLaunchDataset = LaunchDataset & { bulletin: LaunchBulletin };

export type LaunchDatasetList = {
  active: LaunchDataset;
  datasets: LaunchDataset[];
};

export async function fetchActiveLaunchDataset(): Promise<ActiveLaunchDataset> {
  const response = await fetch("/api/launch-admin?dataset=active", { cache: "no-store" });
  if (!response.ok) throw Error("Etkinlik veri seti yüklenemedi.");
  return response.json();
}
