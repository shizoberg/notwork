import { useEffect, useState } from "react";
import {
  defaultLaunchFlow,
  getLaunchFlow,
  launchImageLimit,
  validateLaunchFlow,
  type LaunchFlow,
} from "@/lib/launch-flow";

const cleanLines = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);

export function LaunchFlowAdmin({ onSaved }: { onSaved?: (flow: LaunchFlow) => void }) {
  const [flow, setFlow] = useState<LaunchFlow>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(-1);

  async function upload(key: "logo" | "cover", file?: File) {
    if (!file) return;
    if (file.size > launchImageLimit) {
      setError("Görsel en fazla 2 MB olabilir.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const response = await fetch("/api/launch-admin?asset=upload", {
        method: "POST",
        body: file,
      });
      if (!response.ok) throw Error(await response.text());
      const { url } = await response.json();
      edit({ [key]: url });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  }

  function load() {
    setError("");
    void getLaunchFlow()
      .then((data) => {
        setFlow(data);
        setDirty(false);
      })
      .catch((error) => setError(error.message));
  }
  useEffect(load, []);

  function edit(patch: Partial<LaunchFlow>) {
    setFlow((current) => current && { ...current, ...patch });
    setStatus("");
    setDirty(true);
  }

  async function save() {
    if (!flow) return;
    setError("");
    setSaving(true);
    try {
      const draft = validateLaunchFlow({
        ...flow,
        categories: cleanLines(flow.categories),
        questions: flow.questions.map((question) => ({
          ...question,
          options: cleanLines(question.options),
        })),
      });
      const response = await fetch("/api/launch-admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "saveFlow", flow: draft }),
      });
      if (!response.ok) throw Error(await response.text());
      const saved = await response.json();
      setFlow(saved);
      onSaved?.(saved);
      setDirty(false);
      setStatus("Akış kaydedildi. Katılımcılar sayfayı açtığında yeni akışı görecek.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Akış kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ls-panel ls-flow-editor" aria-labelledby="launch-flow-title">
      <p className="ls-eyebrow">14 Kasım · launchspace</p>
      <h2 id="launch-flow-title">Etkinlik akışını düzenle</h2>
      <a href="/launch-space" target="_blank" rel="noreferrer">
        Katılımcı ekranını aç ↗
      </a>
      <ol className="ls-flow-steps">
        <li>İsim ve etkinlik onayı</li>
        <li>Alanım ve etkinlik uygulamaları</li>
      </ol>
      {flow ? (
        <div className="ls-editor-grid">
          <aside className="ls-editor-preview" aria-label="Katılımcı önizlemesi">
            <p className="ls-eyebrow">Katılımcı önizlemesi</p>
            <div className="ls-preview-steps">
              {["Kayıt", "Program"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={preview === (index === 0 ? -1 : 3)}
                  onClick={() => setPreview(index === 0 ? -1 : 3)}
                >
                  {label}
                </button>
              ))}
            </div>
            {preview === -1 ? (
              <>
                <img className="ls-preview-cover" src={flow.cover} alt="Etkinlik kapağı" />
                <div className="ls-preview-brand">
                  <img src={flow.logo} alt="" />
                  <strong>{flow.organizerName}</strong>
                </div>
                <h3>{flow.welcomeTitle}</h3>
                <p className="ls-flow-copy">{flow.welcomeText}</p>
                <span className="ls-preview-choice">{flow.registerLabel}</span>
                <span className="ls-preview-choice">Adın ve soyadın · etkinlik onayı</span>
              </>
            ) : (
              <>
                <h3>Etkinlik programı</h3>
                <ul className="ls-nodes-votes">
                  {flow.schedule.map(({ time, label }, index) => (
                    <li key={index}>
                      {time} · {label}
                    </li>
                  ))}
                </ul>
                <p>{flow.apps.map((app) => (app === "match" ? flow.matchLabel : flow.votesLabel)).join(" → ")}</p>
              </>
            )}
          </aside>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <fieldset disabled={saving || uploading}>
              <details open onFocus={() => setPreview(-1)}>
                <summary>Etkinlik amacı ve giriş</summary>
                <label>
                  Organizasyon adı
                  <input
                    maxLength={60}
                    required
                    value={flow.organizerName}
                    onChange={(e) => edit({ organizerName: e.target.value })}
                  />
                </label>
                {(["logo", "cover"] as const).map((key) => (
                  <div key={key} className="ls-brand-edit">
                    <img
                      src={flow[key]}
                      alt={
                        key === "logo"
                          ? "Profil fotoğrafı önizlemesi"
                          : "Kapak fotoğrafı önizlemesi"
                      }
                    />
                    <label>
                      {key === "logo" ? "Profil fotoğrafı / logo" : "Kapak fotoğrafı"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          void upload(key, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {flow[key] !== defaultLaunchFlow[key] && (
                      <button
                        type="button"
                        className="ls-secondary"
                        onClick={() => edit({ [key]: defaultLaunchFlow[key] })}
                      >
                        Varsayılanı kullan
                      </button>
                    )}
                  </div>
                ))}
                <p className="ls-caption">JPG, PNG veya WebP · en fazla 2 MB.</p>
                <label>
                  Başlık
                  <textarea
                    required
                    maxLength={100}
                    value={flow.welcomeTitle}
                    onChange={(e) => edit({ welcomeTitle: e.target.value })}
                  />
                </label>
                <label>
                  Etkinlik amacı
                  <textarea
                    required
                    maxLength={240}
                    value={flow.welcomeText}
                    onChange={(e) => edit({ welcomeText: e.target.value })}
                  />
                </label>
                <label className="ls-check">
                  <input type="checkbox" checked={flow.showSelfie} onChange={(event) => edit({ showSelfie: event.target.checked })} />
                  <span>İsteğe bağlı grup selfiesini göster</span>
                </label>
                {(
                  [
                    ["registerLabel", "Kayıt butonu"],
                    ["matchLabel", "Eşleşme adı"],
                    ["votesLabel", "Oylama adı"],
                    ["voteReminder", "Oylama hatırlatması"],
                    ["routeLabel", "Tanışma rotası butonu"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      required
                      maxLength={key === "voteReminder" ? 180 : key === "routeLabel" ? 60 : 48}
                      value={flow[key]}
                      onChange={(e) => edit({ [key]: e.target.value })}
                    />
                  </label>
                ))}
              </details>
              <details onFocus={() => setPreview(3)}>
                <summary>Program ve uygulama sırası</summary>
                {flow.schedule.map((item, index) => (
                  <div className="ls-flow-row" key={index}>
                    <label>
                      Saat
                      <input
                        type="time"
                        required
                        value={item.time}
                        onChange={(e) =>
                          edit({
                            schedule: flow.schedule.map((row, i) =>
                              i === index ? { ...row, time: e.target.value } : row,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Program adımı
                      <input
                        required
                        maxLength={55}
                        value={item.label}
                        onChange={(e) =>
                          edit({
                            schedule: flow.schedule.map((row, i) =>
                              i === index ? { ...row, label: e.target.value } : row,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="ls-secondary"
                      disabled={flow.schedule.length === 1}
                      onClick={() =>
                        edit({ schedule: flow.schedule.filter((_, i) => i !== index) })
                      }
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="ls-secondary"
                  disabled={flow.schedule.length >= 12}
                  onClick={() =>
                    edit({ schedule: [...flow.schedule, { time: "20:00", label: "" }] })
                  }
                >
                  Program adımı ekle
                </button>
                <label>
                  İlk uygulama
                  <select
                    value={flow.apps[0]}
                    onChange={(e) =>
                      edit({
                        apps: e.target.value === "match" ? ["match", "poll"] : ["poll", "match"],
                      })
                    }
                  >
                    <option value="match">{flow.matchLabel} → {flow.votesLabel}</option>
                    <option value="poll">{flow.votesLabel} → {flow.matchLabel}</option>
                  </select>
                </label>
              </details>
              <button className="ls-primary" disabled={!dirty || saving}>
                {uploading ? "Görsel yükleniyor…" : saving ? "Kaydediliyor…" : "Akışı kaydet"}
              </button>
            </fieldset>
          </form>
        </div>
      ) : !error ? (
        <p role="status">Akış yükleniyor…</p>
      ) : null}
      {status && <p role="status">{status}</p>}
      {error && (
        <p role="alert" className="ls-caption">
          {error}
        </p>
      )}
      {error && !flow && (
        <button className="ls-secondary" onClick={load}>
          Tekrar yükle
        </button>
      )}
    </section>
  );
}
