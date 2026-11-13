import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { atomicState, readAtomicState } from "./_atomic-state.mjs";
import {
  createEventProductNamespace,
  type EventDataMode,
  type NotworkEvent,
} from "../../src/lib/event-registry.ts";
import { launchCompanyQuestions, type PollConfig } from "../../src/lib/event-poll.ts";
import type {
  LaunchAnnouncement,
  LaunchBulletin,
  LaunchDataset,
  LaunchDatasetList,
} from "../../src/lib/launch-dataset.ts";

type Manifest = { activeId: string | null; datasets: LaunchDataset[] };
const empty = (): Manifest => ({ activeId: null, datasets: [] });
const store = () => getStore({ name: "event-network", consistency: "strong" });
const manifestKey = (event: NotworkEvent) => `events/${event.id}/matchlab/launch-datasets.json`;
const legacy = (mode: EventDataMode): LaunchDataset => ({
  id: `legacy-${mode}`,
  name: mode === "demo" ? "Mevcut test verileri" : "Mevcut etkinlik verileri",
  mode,
  createdAt: null,
});

export function launchDatasetPrefix(event: NotworkEvent, dataset: LaunchDataset) {
  const prefix = createEventProductNamespace(event, "matchlab", dataset.mode).keyPrefix;
  return dataset.createdAt
    ? `events/${event.id}/launch-datasets/${dataset.id}/${dataset.mode}/matchlab`
    : prefix;
}

export function launchPollKey(prefix: string) {
  return `${prefix}/poll/company-vote.json`;
}

export async function getLaunchBulletin(
  event: NotworkEvent,
  dataset: LaunchDataset,
): Promise<LaunchBulletin> {
  const state = await readAtomicState<{ config?: PollConfig; announcement?: LaunchAnnouncement }>(
    store(),
    launchPollKey(launchDatasetPrefix(event, dataset)),
    () => ({}),
  );
  const config = state.config;
  return {
    announcement: state.announcement ?? null,
    vote: config?.isOpen
      ? { version: config.questionVersion || 1, title: config.questions[0].title }
      : null,
  };
}

function view(event: NotworkEvent, manifest: Manifest): LaunchDatasetList {
  const datasets = [legacy("demo"), legacy("live"), ...manifest.datasets];
  return {
    datasets,
    active:
      datasets.find((row) => row.id === manifest.activeId) ??
      legacy(event.products.matchlab.dataMode),
  };
}

export async function getLaunchDatasets(event: NotworkEvent) {
  return view(event, await readAtomicState(store(), manifestKey(event), empty));
}

export async function changeLaunchDataset(
  event: NotworkEvent,
  input: { action: string; id?: unknown; name?: unknown; mode?: unknown; activate?: unknown },
) {
  const blob = store();
  const previous = await getLaunchDatasets(event);
  let dataset: LaunchDataset | undefined;
  if (input.action === "createDataset") {
    const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
    if (!name || name.length > 60) throw Error("Veri setine 1–60 karakterlik bir ad ver.");
    if (input.mode !== "demo" && input.mode !== "live")
      throw Error("Test veya etkinlik türünü seç.");
    if (previous.datasets.length >= 52) throw Error("Veri seti sınırına ulaşıldı.");
    dataset = { id: randomUUID(), name, mode: input.mode, createdAt: new Date().toISOString() };
    const pollKey = (row: LaunchDataset) => launchPollKey(launchDatasetPrefix(event, row));
    const previousPoll = await readAtomicState<{ config?: PollConfig }>(
      blob,
      pollKey(previous.active),
      () => ({}),
    );
    await atomicState(
      blob,
      pollKey(dataset),
      () => ({
        config: {
          revision: 1,
          questionVersion: 1,
          isOpen: true,
          publishedQuestion: null,
          questions: previousPoll.config?.questions ?? launchCompanyQuestions,
        },
        ballots: {},
      }),
      () => undefined,
    );
  }
  return atomicState(blob, manifestKey(event), empty, (manifest) => {
    const current = view(event, manifest);
    if (dataset) {
      if (manifest.datasets.length >= 50) throw Error("Veri seti sınırına ulaşıldı.");
      manifest.datasets.push(dataset);
      if (input.activate === true) manifest.activeId = dataset.id;
    } else {
      if (!current.datasets.some((row) => row.id === input.id))
        throw Error("Veri seti bulunamadı.");
      manifest.activeId = String(input.id);
    }
    return view(event, manifest);
  });
}
