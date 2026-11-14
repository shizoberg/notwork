import { useEffect, useState } from "react";

type Member = { id: string; name: string; code?: string; jobTitle?: string; rating: number | null; ratedAt?: string };
type Photo = { key: string; savedAt: string; participantId: string };
type Report = { event: { name: string }; dataset: { id: string; name: string }; datasets: { id: string; name: string }[]; summary: { participants: number; groups: number; ratings: number; average: number | null; selfies: number; distribution: {stars:number;count:number}[] }; groups: { id: string; name: string; round: number; generatedAt: string; members: Member[]; selfies: Photo[] }[] };
function download(name: string, value: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function MatchReportAdmin({event, password = ""}: {event: string; password?: string}) {
  const [report, setReport] = useState<Report>();
  const [dataset, setDataset] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<Record<string,string>>({});
  async function request(action: string, photoKey?: string) {
    const r = await fetch("/api/admin/event-products/network", {method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({action,event,password,datasetId:dataset || undefined,photoKey})});
    if(!r.ok) throw Error("Veriler yüklenemedi. Oturumunu kontrol edip tekrar dene.");
    return r.json();
  }
  async function load() { setBusy(true); setError(""); try {setReport(await request("matchReport"));} catch(e) {setError((e as Error).message);} finally {setBusy(false);} }
  useEffect(() => {setReport(undefined);setPhotos({});void load();},[dataset,event]);
  async function showPhoto(key: string) {try { const r=await request("matchReportPhoto",key); setPhotos(old=>({...old,[key]:r.photo})); } catch(e){setError((e as Error).message);} }
  function csv() {
    if(!report)return;
    const cell=(v:unknown)=>'"'+String(v??"").replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    const rows = [["Etkinlik","Veri seti","Grup","Tur","Kişi","Kod","Unvan","Puan","Puan zamanı","Selfie sayısı"],...report.groups.flatMap(g=>g.members.map(m=>[report.event.name,report.dataset.name,g.name,g.round,m.name,m.code,m.jobTitle,m.rating,m.ratedAt,g.selfies.length]))];
    download(`match-${report.dataset.id}.csv`,"\uFEFF"+rows.map(r=>r.map(cell).join(';')).join('\r\n'),"text/csv;charset=utf-8");
  }
  async function archive() {
    if(!report)return;setBusy(true);setError("");
    try {const images=[];for(const g of report.groups)for(const p of g.selfies){const image=await request("matchReportPhoto",p.key);images.push({...p,groupId:g.id,photo:image.photo});}
      download(`match-arsiv-${report.dataset.id}.json`,JSON.stringify({...report,selfieFiles:images},null,2),"application/json");
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  const filtered = report?.groups.filter(g => `${g.name} ${g.members.map(m => `${m.name} ${m.code || ""}`).join(" ")}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))) || [];
  return <section className="ls-panel ls-report">
    <h2>Eşleşme raporu</h2><p className="ls-caption">Kim kiminle tanıştı, ne kadar faydalı buldu? Veri seti seçimi yalnızca raporu değiştirir; etkinliği etkilemez.</p>
    {report && <label>İncelenen veri seti<select value={dataset || report.dataset.id} disabled={busy} onChange={e=>setDataset(e.target.value)}>{report.datasets.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>}
    <div className="ls-report-actions"><button className="ls-secondary" disabled={busy} onClick={()=>void load()}>Yenile</button><button className="ls-secondary" disabled={!report||busy} onClick={csv}>Excel için CSV</button><button className="ls-secondary" disabled={!report||busy} onClick={()=>void archive()}>Selfieler dahil JSON indir</button></div>
    {busy&&<p role="status">Veriler hazırlanıyor…</p>}{error&&<p role="alert">{error}</p>}
    {report&&<><h3>{report.event.name} · {report.dataset.name}</h3><div className="ls-report-stats">{[["Katılımcı",report.summary.participants],["Eşleşme",report.summary.groups],["Puan",report.summary.ratings],["Ortalama",report.summary.average?.toFixed(2)??"—"],["Selfie",report.summary.selfies]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <p className="ls-caption">Ortalama yalnızca puan verenlerden hesaplanır. Aynı kişi farklı eşleşmeleri ayrı ayrı puanlayabilir.</p>
    <div className="ls-report-distribution">{report.summary.distribution.map(d=><div key={d.stars}><span>{d.stars} ★</span><progress value={d.count} max={Math.max(1,report.summary.ratings)}/><span>{d.count}</span></div>)}</div>
    {!report.groups.length&&<p>Bu veri setinde henüz eşleşme yok.</p>}
    <label>Grup veya kişi ara<input value={query} onChange={e=>{setQuery(e.target.value);setLimit(20);}} placeholder="İsim, kod veya grup adı" /></label>
    {filtered.slice(0,limit).map(g=><details className="ls-report-group" key={g.id}><summary>{g.name} · Tur {g.round} · {g.members.filter(m=>m.rating).length}/{g.members.length} puan · {g.selfies.length} selfie</summary><p className="ls-caption">{new Date(g.generatedAt).toLocaleString('tr-TR')}</p>
      {g.members.map(m=><div className="ls-report-member" key={m.id}><div><strong>{m.name}</strong><small>{m.code} · {m.jobTitle}</small></div><span>{m.rating ? `${m.rating}/5 ★` : "Puan vermedi"}</span></div>)}
      {g.selfies.map(p=><div key={p.key} className="ls-report-photo">{photos[p.key]?<><img src={photos[p.key]} alt={`${g.name} grup selfiesi`} /><a href={photos[p.key]} download={`${g.name}-${p.key.split('/').pop()?.replace('.json','.jpg')}`}>Fotoğrafı indir</a></>:<button className="ls-secondary" onClick={()=>void showPhoto(p.key)}>Selfieyi göster · {new Date(p.savedAt).toLocaleString('tr-TR')}</button>}</div>)}
    </details>)}
    {filtered.length>limit&&<button className="ls-secondary" onClick={()=>setLimit(n=>n+20)}>20 grup daha göster ({filtered.length-limit} kaldı)</button>}</>}
  </section>;
}
