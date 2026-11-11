import { useEffect, useState } from "react";
import { getLaunchFlow, validateLaunchFlow, type LaunchFlow } from "@/lib/launch-flow";

const splitLines = (text: string) => text.split("\n");
const cleanLines = (lines: string[]) => lines.map((line) => line.trim()).filter(Boolean);
const questionNames = ["Kendini tanıtma", "Sunabileceği katkı", "Aradığı bağlantı"];

export function LaunchFlowAdmin() {
  const [flow, setFlow] = useState<LaunchFlow>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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
      setFlow(await response.json());
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
      <p className="ls-eyebrow">14 Kasım · Launch Space</p>
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <fieldset disabled={saving}>
            <details open>
              <summary>Karşılama ve butonlar</summary>
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
                Açıklama
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
                  <section key={index} className="ls-flow-question">
                    <h3>{questionNames[index]}</h3>
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
                      Soru
                      <input
                        required
                        maxLength={140}
                        value={question.label}
                        onChange={(e) => update({ label: e.target.value })}
                      />
                    </label>
                    <label>
                      Örnek cevap
                      <input
                        maxLength={160}
                        value={question.placeholder}
                        onChange={(e) => update({ placeholder: e.target.value })}
                      />
                    </label>
                    <label>
                      Cevap seçenekleri
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
            <details>
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
                    onClick={() => edit({ schedule: flow.schedule.filter((_, i) => i !== index) })}
                  >
                    Kaldır
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ls-secondary"
                disabled={flow.schedule.length >= 12}
                onClick={() => edit({ schedule: [...flow.schedule, { time: "20:00", label: "" }] })}
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
              {saving ? "Kaydediliyor…" : "Akışı kaydet"}
            </button>
          </fieldset>
        </form>
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
