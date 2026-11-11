export const EVENT_TYPES = [
  { value: "training", label: "Training", icon: "◎" },
  { value: "10K", label: "10K", icon: "⚑" },
  { value: "marathon", label: "Marathon", icon: "✦" },
  { value: "trail", label: "Trail", icon: "▲" },
];

export const FALLBACK_IMAGES = {
  training: "photo-1552674605-db6ffd4facb5",
  "10K": "photo-1513593771513-7b58b6c4af38",
  marathon: "photo-1461896836934-ffe607ba8211",
  trail: "photo-1473448912268-2022ce9509d8",
};

export function getEventImage(event, width = 900) {
  if (event.imageUrl) {
    return event.imageUrl;
  }
  const id = FALLBACK_IMAGES[event.type] || FALLBACK_IMAGES.training;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export function formatDate(value, withTime = false) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
