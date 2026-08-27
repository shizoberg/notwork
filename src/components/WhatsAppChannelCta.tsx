const WHATSAPP_CHANNEL_URL = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

export function WhatsAppChannelCta() {
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="notwork WhatsApp duyuru kanalına katıl"
      title="WhatsApp duyuru kanalımıza katıl"
      className="group fixed bottom-4 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-[#25D366] text-white shadow-[0_14px_36px_rgba(7,17,18,0.24)] transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
    >
      <span className="relative flex items-center justify-center">
        <WhatsAppIcon />
        <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#25D366] bg-white" />
      </span>
      <span className="sr-only">Biletlerden ve yeni gecelerden önce haberdar ol.</span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 fill-current text-white">
      <path d="M16.04 5.34a10.3 10.3 0 0 0-8.94 15.4L5.72 25.8l5.18-1.36a10.3 10.3 0 1 0 5.14-19.1Zm0 18.72c-1.58 0-3.13-.43-4.47-1.24l-.32-.19-3.07.81.82-2.99-.21-.34a8.42 8.42 0 1 1 7.25 3.95Zm4.62-6.3c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12-.17.26-.65.82-.8.99-.15.17-.3.19-.55.06-1.49-.74-2.47-1.33-3.46-3.02-.26-.45.26-.42.75-1.39.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.49-.42-.43-.57-.44h-.49c-.17 0-.44.07-.67.32-.23.26-.88.86-.88 2.1s.9 2.43 1.02 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.08 1.5-.61 1.71-1.2.21-.6.21-1.11.15-1.22-.06-.1-.23-.17-.48-.3Z" />
    </svg>
  );
}
