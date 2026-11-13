import { useEffect, useRef, useState } from "react";

// Shared by the directory and Match. Fetch only visible faces; never persist private images.
const photos = new Map<string, { photo: string; expires: number }>();
export function LaunchAvatar({ event, datasetId, token, id, name, className = "ls-avatar" }: {
  event: string; datasetId?: string; token: string; id: string; name: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [photo, setPhoto] = useState("");
  useEffect(() => {
    setPhoto("");
    const controller = new AbortController();
    const key = `${event}:${datasetId}:${token}:${id}`;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const saved = photos.get(key);
      if (saved && saved.expires > Date.now()) { setPhoto(saved.photo); return; }
      void fetch("/api/event-products/network", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ event, datasetId, accessToken: token, action: "launchProfilePhoto", targetId: id }),
      }).then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (controller.signal.aborted) return;
        const value = typeof data.photo === "string" ? data.photo : "";
        if (photos.size > 400) photos.clear();
        photos.set(key, { photo: value, expires: Date.now() + 60000 });
        setPhoto(value);
      }).catch(() => {});
    }, { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); controller.abort(); };
  }, [event, datasetId, token, id]);
  return <span ref={ref} className={className}>{photo ? <img src={photo} alt={name} /> : name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR")}</span>;
}
