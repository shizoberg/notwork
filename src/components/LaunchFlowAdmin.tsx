import { useEffect, useState } from "react";
import {
  defaultLaunchFlow,
  getLaunchFlow,
  launchImageLimit,
  validateLaunchFlow,
  type LaunchFlow,
} from "@/lib/launch-flow";

const splitLines = (text: string) => text.split("\n");
const cleanLines = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);
const questionNames = ["Kendini tanıtma", "Sunabileceği katkı", "Aradığı bağlantı"];

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
        <li>Karşılama ve profil girişi</li>
        <li>Katılımcı bilgileri</li>
        <li>Üç kayıt sorusu</li>
        <li>Kayıt onayı</li>
        <li>Alanım ve etkinlik uygulamaları</li>
      </ol>
      {flow ? (
        <div className="ls-editor-grid">
          <aside className="ls-editor-preview" aria-label="Katılımcı önizlemesi">
            <p className="ls-eyebrow">Katılımcı önizlemesi</p>
            <div className="ls-preview-steps">
              {["Giriş", "Soru 1", "Soru 2", "Soru 3", "Program", "Onay"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={preview === index - 1}
                  onClick={() => setPreview(index - 1)}
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
                <span className="ls-preview-choice">{flow.loginLabel}</span>
              </>
            ) : preview < 3 ? (
              <>
                <h3>{flow.questions[preview].title}</h3>
                <p>{flow.questions[preview].label}</p>
                {cleanLines(flow.questions[preview].options).length ? (
                  cleanLines(flow.questions[preview].options).map((option, index) => (
                    <span className="ls-preview-choice" key={index}>
                      ○ {option}
                    </span>
                  ))
                ) : (
                  <span className="ls-preview-choice ls-preview-textarea">
                    {flow.questions[preview].placeholder || "Yanıtını yaz"}
                  </span>
                )}
                {preview === 1 && (
                  <span className="ls-preview-choice">
                    {flow.categoryLabel} · {cleanLines(flow.categories).join(" / ")}
                  </span>
                )}
                <span className="ls-preview-choice ls-preview-next">{flow.nextLabel}</span>
              </>
            ) : preview === 3 ? (
              <>
                <h3>Etkinlik programı</h3>
                <ul className="ls-nodes-votes">
                  {flow.schedule.map(({ time, label }, index) => (
                    <li key={index}>
                      {time} · {label}
                    </li>
                  ))}
                </ul>
                <p>{flow.apps.map((app) => (app === "match" ? "Match" : "Anket")).join(" → ")}</p>
              </>
            ) : (
              <>
                <h3>Tanışmaya hazırsın.</h3>
                <span className="ls-preview-choice">□ Etkinlik onayı</span>
                <span className="ls-preview-choice ls-preview-next">{flow.finishLabel}</span>
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
                {(
                  [
                    ["registerLabel", "Kayıt butonu"],
                    ["loginLabel", "Mevcut profil butonu"],
                    ["nextLabel", "İlerleme butonu"],
                    ["finishLabel", "Kaydı tamamlama butonu"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      required
                      maxLength={48}
                      value={flow[key]}
                      onChange={(e) => edit({ [key]: e.target.value })}
                    />
                  </label>
                ))}
              </details>
              <details>
                <summary>Kayıt soruları ve cevap seçenekleri</summary>
                <p className="ls-caption">
                  Her satıra bir cevap yaz. Liste boşsa katılımcı kendi cevabını yazar.
                </p>
                {flow.questions.map((question, index) => {
                  function update(patch: Partial<typeof question>) {
                    edit({
                      questions: flow!.questions.map((item, i) =>
                        i === index ? { ...item, ...patch } : item,
                      ),
                    });
                  }
                  return (
                    <section
                      key={index}
                      className="ls-flow-question"
                      onFocus={() => setPreview(index)}
                    >
                      <h3>
                        {index + 1}. soru · {questionNames[index]}
                      </h3>
                      <label>
                        Ekran başlığı
                        <input
                          required
                          maxLength={90}
                          value={question.title}
                          onChange={(e) => update({ title: e.target.value })}
                        />
                      </label>
                      <label>
                        Katılımcıya sorulan soru
                        <input
                          required
                          maxLength={140}
                          value={question.label}
                          onChange={(e) => update({ label: e.target.value })}
                        />
                      </label>
                      <label>
                        Yanıt kutusunda görünen ipucu
                        <input
                          maxLength={160}
                          value={question.placeholder}
                          onChange={(e) => update({ placeholder: e.target.value })}
                        />
                      </label>
                      <label>
                        Seçim butonları · her satıra bir seçenek
                        <textarea
                          value={question.options.join("\n")}
                          onChange={(e) => update({ options: splitLines(e.target.value) })}
                        />
                      </label>
                    </section>
                  );
                })}
                <label>
                  Katkı alanı başlığı
                  <input
                    required
                    maxLength={48}
                    value={flow.categoryLabel}
                    onChange={(e) => edit({ categoryLabel: e.target.value })}
                  />
                </label>
                <label>
                  Katkı alanı seçenekleri
                  <textarea
                    required
                    value={flow.categories.join("\n")}
                    onChange={(e) => edit({ categories: splitLines(e.target.value) })}
                  />
                </label>
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
                    <option value="match">Match → Anket</option>
                    <option value="poll">Anket → Match</option>
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
