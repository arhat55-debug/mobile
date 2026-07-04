export function formatPrice(value?: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "дөнгөж сая";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цаг өмнө`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} өдрийн өмнө`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} сарын өмнө`;
  return `${Math.floor(mo / 12)} жилийн өмнө`;
}

export function safeMessengerHref(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    const allowed = [
      "m.me",
      "messenger.com",
      "www.messenger.com",
      "facebook.com",
      "www.facebook.com",
      "fb.com",
    ];
    if (!allowed.includes(host)) return null;
    return u.toString();
  } catch {
    return null;
  }
}
