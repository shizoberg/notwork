import { useEffect, useState } from "react";
import type { LaunchDataset, LaunchDatasetList } from "@/lib/launch-dataset";
import type { EventDataMode } from "@/lib/event-registry";

async function datasetRequest(
  action: string,
  data: Record<string, unknown> = {},
): Promise<LaunchDatasetList> {
  const response = await fetch("/api/launch-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  if (!response.ok) throw Error(await response.text());
  return response.json();
}

export function LaunchDatasetAdmin({
  onActiveChanged,
  switchingDisabled,
}: {
  onActiveChanged: (dataset: LaunchDataset) => void;
  switchingDisabled: boolean;
}) {
  const [data, setData] = useState<LaunchDatasetList>();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<EventDataMode>("demo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let current = true;
    void datasetRequest("listDatasets")
      .then((result) => {
        if (current) setData(result);
      })
      .catch((e) => {
        if (current) setError(e.message);
      });
    return () => {
      current = false;
    };
  }, []);

  async function change(
    action: "activateDataset" | "createDataset",
    input: Record<string, unknown>,
  ) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await datasetRequest(action, input);
      setData(result);
      if (result.active.id !== data?.active.id) {
        onActiveChanged(result.active);
        setNotice(`${result.active.name} etkinleştirildi.`);
      } else {
        setNotice("Boş veri seti oluşturuldu.");
      }
      if (action === "createDataset") setName("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ls-panel ls-dataset-panel" aria-labelledby="ls-dataset-title">
      <p className="ls-eyebrow">launchspace</p>
      <h2 id="ls-dataset-title">Database</h2>
      <p className="ls-caption">
        Her setin kayıtları, Match grupları ve anket oyları ayrı tutulur. Yeni set boş başlar ve
        mevcut anket sorularını alır.
      </p>
      {data ? (
        <>
          <p>
            Aktif veri seti <strong>{data.active.name}</strong>
          </p>
          <ul className="ls-dataset-list">
            {data.datasets.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.mode === "demo" ? "Test" : "Etkinlik"}</small>
                </div>
                {data.active.id === item.id ? (
                  <span className="ls-eyebrow">Aktif</span>
                ) : (
                  <button
                    type="button"
                    className="ls-secondary"
                    disabled={busy || switchingDisabled}
                    aria-label={`${item.name} veri setine geç`}
                    onClick={() => void change("activateDataset", { id: item.id })}
                  >
                    Bu sete geç
                  </button>
                )}
              </li>
            ))}
          </ul>
          <form
            className="ls-flow-question"
            onSubmit={(e) => {
              e.preventDefault();
              const activate =
                (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "activate";
              if (!activate || !switchingDisabled)
                void change("createDataset", { name, mode, activate });
            }}
          >
            <h3>Yeni veri seti oluştur</h3>
            <label>
              Veri seti adı
              <input
                required
                maxLength={60}
                value={name}
                placeholder="Örn. 14 Kasım prova"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Kullanım
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value === "live" ? "live" : "demo")}
              >
                <option value="demo">Test</option>
                <option value="live">Etkinlik</option>
              </select>
            </label>
            <div className="ls-actions">
              <button className="ls-secondary" disabled={busy || !name.trim()} value="create">
                Oluştur
              </button>
              <button
                className="ls-primary"
                disabled={busy || switchingDisabled || !name.trim()}
                value="activate"
              >
                Oluştur ve bu sete geç
              </button>
            </div>
            {switchingDisabled && (
              <p className="ls-caption">
                Eşleşme işlemi tamamlandığında veri seti değiştirilebilir.
              </p>
            )}
          </form>
        </>
      ) : (
        !error && <p role="status">Veri setleri yükleniyor…</p>
      )}
      {notice && (
        <p role="status" className="ls-caption">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="ls-caption">
          {error}
        </p>
      )}
    </section>
  );
}
