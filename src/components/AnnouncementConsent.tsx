export function AnnouncementConsent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong className="mb-1 block">notwork’ten haber almak istiyorum · isteğe bağlı</strong>
        Adımın ve e-posta adresimin notwork etkinlik, bilet ve topluluk duyuruları için
        kullanılmasına ve bana e-posta ile ticari elektronik ileti gönderilmesine izin veriyorum.
        İzin isteğe bağlıdır; dilediğim zaman ücretsiz ayrılabilirim.{" "}
        <a href="/kvkk" target="_blank" rel="noreferrer" className="underline">
          KVKK Aydınlatma Metni
        </a>{" "}
        ·{" "}
        <a href="/acik-riza" target="_blank" rel="noreferrer" className="underline">
          Açık Rıza Metni
        </a>
      </span>
    </label>
  );
}
