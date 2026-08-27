const WHATSAPP_CHANNEL_URL = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

export function WhatsAppChannelCta() {
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="notwork WhatsApp duyuru kanalına katıl"
      className="group fixed bottom-4 right-3 z-30 flex w-[min(218px,calc(100vw-1.5rem))] items-center gap-2.5 rounded-[18px] border border-white/35 bg-[#0d2419]/94 px-2.5 py-2 text-white shadow-[0_16px_44px_rgba(7,17,18,0.24)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-[#123222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] sm:bottom-6 sm:right-6 sm:w-[238px] sm:px-3 sm:py-2.5"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-[0_0_0_4px_rgba(37,211,102,0.12)]">
        <WhatsAppIcon />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d2419] bg-white" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black leading-tight sm:text-[11px]">
          WhatsApp duyuru kanalımıza katıl
        </span>
        <span className="mt-0.5 block text-[8px] leading-snug text-white/62 sm:text-[9px]">
          Biletlerden ve yeni gecelerden önce haberdar ol.
        </span>
      </span>
      <span className="pr-0.5 text-sm text-[#25D366] transition group-hover:translate-x-0.5">
        →
      </span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5 fill-current text-white">
      <path d="M16.04 5.34a10.3 10.3 0 0 0-8.94 15.4L5.72 25.8l5.18-1.36a10.3 10.3 0 1 0 5.14-19.1Zm0 18.72c-1.58 0-3.13-.43-4.47-1.24l-.32-.19-3.07.81.82-2.99-.21-.34a8.42 8.42 0 1 1 7.25 3.95Zm4.62-6.3c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12-.17.26-.65.82-.8.99-.15.17-.3.19-.55.06-1.49-.74-2.47-1.33-3.46-3.02-.26-.45.26-.42.75-1.39.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.49-.42-.43-.57-.44h-.49c-.17 0-.44.07-.67.32-.23.26-.88.86-.88 2.1s.9 2.43 1.02 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.08 1.5-.61 1.71-1.2.21-.6.21-1.11.15-1.22-.06-.1-.23-.17-.48-.3Z" />
    </svg>
  );
}
