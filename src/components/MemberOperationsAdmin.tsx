import { useMemo, useState } from "react";

type Contact = {
  email: string;
  names: string[];
  groups: string[];
  sources: string[];
  announcementConsent: string;
};
const fieldClass = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";
const buttonClass = "rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-50";

export function MemberOperationsAdmin({
  password,
  refresh,
}: {
  password: string;
  refresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState({ name: "", email: "", headline: "", bio: "", website: "" });
  const [message, setMessage] = useState("");
  const [credential, setCredential] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [group, setGroup] = useState("");
  const [busy, setBusy] = useState(false);
  const [testMembers, setTestMembers] = useState<Array<{
    username: string;
    email: string;
    source: string;
  }> | null>(null);
  const groups = useMemo(
    () => [...new Set(contacts.flatMap((row) => [...row.groups, ...row.sources]))].sort(),
    [contacts],
  );
  const selected = contacts.filter(
    (row) => !group || row.groups.includes(group) || row.sources.includes(group),
  );
  async function request(path: string, data: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, ...data }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const escape = (value: string) =>
      `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`;
    const rows = [
      ["eposta", "ad soyad", "kaynak", "grup", "duyuru izni"],
      ...selected.map((row) => [
        row.email,
        row.names.join("; "),
        row.sources.join("; "),
        row.groups.join("; "),
        row.announcementConsent,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `notwork-eposta-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="my-6 space-y-5 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold">Üye hesabı ve duyuru listeleri</h2>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setCredential(null);
          void run(async () => {
            const data = await request("/api/admin/member-profiles", {
              action: "create",
              member: draft,
            });
            setCredential(data.credentials[0] || null);
            setMessage(
              data.created
                ? "Hesap oluşturuldu. Üye ilk girişte şifresini değiştirecek."
                : "Bu e-posta zaten kayıtlı; mevcut hesap ve şifre korundu.",
            );
            await refresh();
          });
        }}
      >
        <label>
          Ad soyad
          <input
            className={fieldClass}
            required
            maxLength={100}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label>
          E-posta
          <input
            className={fieldClass}
            type="email"
            required
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          />
        </label>
        <label>
          Mesleki başlık
          <input
            className={fieldClass}
            required
            maxLength={120}
            value={draft.headline}
            onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
          />
        </label>
        <label>
          Web sitesi
          <input
            className={fieldClass}
            type="url"
            value={draft.website}
            onChange={(e) => setDraft({ ...draft, website: e.target.value })}
          />
        </label>
        <label className="sm:col-span-2">
          Biyografi
          <textarea
            className={fieldClass}
            maxLength={320}
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
        </label>
        <button className={buttonClass} disabled={busy}>
          Hesap oluştur
        </button>
      </form>
      {credential && (
        <div className="rounded-xl bg-muted p-4">
          Kullanıcı adı: <strong>{credential.username}</strong>
          <br />
          Geçici şifre: <code>{credential.temporaryPassword}</code>
          <p className="text-sm">Bu şifre yalnızca şimdi gösterilir. Güvenli şekilde kaydet.</p>
        </div>
      )}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="font-semibold">E-posta grupları</h3>
        <p className="text-sm text-foreground/60">
          Networking, üyelik, Startup, canlı MatchLab ve Five kayıtları tekilleştirilir. Duyuru izni
          bilinmeyen kişiler ayrıca izin alınmadan gönderim listesi sayılmaz. Buradan e-posta
          gönderilmez.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className={buttonClass}
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const data = await request("/api/admin/contacts", { action: "export" });
                setContacts(data.contacts);
                setLoaded(true);
                setGroup("");
                setMessage(
                  `${data.contacts.length} tekil e-posta. ${data.excludedTestRows} test kaydı dışarıda bırakıldı.`,
                );
              })
            }
          >
            Listeyi güncelle
          </button>
          <select
            className="rounded-xl border border-border bg-background px-3"
            aria-label="E-posta grubu"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">Tüm gruplar</option>
            {groups.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <button
            className={buttonClass}
            disabled={busy || !loaded || selected.length === 0}
            onClick={download}
          >
            CSV indir · {selected.length}
          </button>
        </div>
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <button
          className={buttonClass}
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const data = await request("/api/admin/contacts", { action: "testMembers" });
              setTestMembers(data.members);
            })
          }
        >
          Test hesaplarını bul
        </button>
        {testMembers && (
          <>
            <p className="text-sm">
              {new Set(testMembers.map((row) => row.email)).size} test hesabı bulundu.
            </p>
            <ul className="text-sm">
              {testMembers.map((row) => (
                <li key={`${row.source}/${row.username}`}>
                  {row.username} · {row.email} · {row.source}
                </li>
              ))}
            </ul>
            {testMembers.length > 0 && (
              <button
                className={buttonClass}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const data = await request("/api/admin/contacts", {
                      action: "deleteTestMembers",
                    });
                    setTestMembers([]);
                    setContacts([]);
                    setLoaded(false);
                    setMessage(`${data.members.length} test kaydı yedeklenerek silindi.`);
                    await refresh();
                  })
                }
              >
                Test hesaplarını yedekle ve sil
              </button>
            )}
          </>
        )}
      </div>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
