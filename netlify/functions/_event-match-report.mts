import type { getEventNetworkStore } from "./_event-network-store.mjs";
import { getEventProductRuntimeContext } from "./_event-product-context.mjs";
import { getLaunchDatasets, launchDatasetPrefix } from "./_launch-datasets.mjs";

type Store = ReturnType<typeof getEventNetworkStore>;
async function rows(store: Store, prefix: string) {
  const keys: string[] = [];
  for await (const page of store.list({ prefix, paginate: true })) keys.push(...page.blobs.map(b => b.key));
  const result: { key: string; data: any }[] = [];
  for (let i = 0; i < keys.length; i += 16) {
    const batch = await Promise.all(keys.slice(i, i + 16).map(async key => ({ key, data: await store.get(key, { type: "json" }) })));
    result.push(...batch.filter(r => r.data));
  }
  return result;
}
export async function eventMatchReport(store: Store, datasetId?: string, photoKey?: string) {
  const ctx = getEventProductRuntimeContext("matchlab");
  if (!ctx) throw Error("Etkinlik gerekli");
  const manifest = ctx.event.slug === "14-kasim-2026" ? await getLaunchDatasets(ctx.event) : null;
  const selected = manifest ? manifest.datasets.find(d => d.id === (datasetId || manifest.active.id)) : null;
  if (manifest && !selected) throw Error("Veri seti bulunamadı");
  const prefix = selected ? launchDatasetPrefix(ctx.event, selected) : ctx.keyPrefix;
  if (photoKey) {
    if (!/^(selfie-archive\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|group-selfies\/[a-zA-Z0-9_-]+)\.json$/.test(photoKey)) throw Error("Geçersiz fotoğraf");
    const record = await store.get(`${prefix}/${photoKey}`, { type: "json" }) as { photo?: string } | null;
    return { photo: record?.photo || "" };
  }
  const [history, participants, feedback, selfies, legacy, snapshots] = await Promise.all([
    rows(store, `${prefix}/match-history/`), rows(store, `${prefix}/participants/`),
    rows(store, `${prefix}/match-feedback/`), rows(store, `${prefix}/selfie-archive/`),
    rows(store, `${prefix}/group-selfies/`), rows(store, `${prefix}/match-profile-snapshots/`),
  ]);
  const people = new Map(participants.map(({ data: r }) => [r.participant.id, {
    id: r.participant.id, name: `${r.profile?.firstName || r.participant.firstName || ""} ${r.profile?.lastName || r.participant.lastName || ""}`.trim(),
    code: r.participant.publicCode, jobTitle: r.jobTitle || "", intro: r.intro || "", offers: r.offers || [], offersDetail: r.offersDetail || "", needs: r.needs || "",
  }]));
  const photos = [...selfies, ...legacy.filter(l => !selfies.some(s => s.data.groupId === l.key.split('/').pop()!.replace('.json', '')))];
  const groups = history.map(({data: g}) => {
    const snapshot = snapshots.find(s => s.data.groupId === g.id)?.data;
    const members = (g.participantIds || []).map((id: string) => {
      const score = feedback.find(f => f.key === `${prefix}/match-feedback/${g.id}/${id}.json`)?.data;
      const old = snapshot?.members?.find((m: any) => m.participantId === id);
      return { ...(people.get(id) || { id, name: id }), ...(old || {}), rating: score?.rating ?? null, ratedAt: score?.recordedAt ?? null };
    });
    return { id: g.id, name: g.groupName || g.id, round: g.round, generatedAt: g.generatedAt, completedAt: g.completedAt || null,
      analysis: g.aiAnalysis || g.reason || "", members,
      selfies: photos.filter(p => (p.data.groupId || p.key.split('/').pop()!.replace('.json', '')) === g.id).map(p => ({ key: p.key.slice(prefix.length + 1), participantId: p.data.participantId, savedAt: p.data.savedAt })),
    };
  });
  const ratings = groups.flatMap(g => g.members.map((m: any) => m.rating).filter((n: any) => Number.isInteger(n) && n >= 1 && n <= 5));
  return { event: { id: ctx.event.id, name: ctx.event.shortTitle, slug: ctx.event.slug }, dataset: selected || { id: ctx.datasetId || ctx.mode, name: ctx.label }, datasets: manifest?.datasets || [], generatedAt: new Date().toISOString(),
    summary: { participants: people.size, groups: groups.length, ratings: ratings.length, average: ratings.length ? ratings.reduce((a: number,b: number) => a+b,0)/ratings.length : null, selfies: photos.length, distribution: [1,2,3,4,5].map(stars => ({stars,count:ratings.filter((r: number)=>r===stars).length})) },
    participants: [...people.values()], groups };
}
