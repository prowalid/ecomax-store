export function formatOrderPrice(value: number) {
  return `${value.toLocaleString("ar-DZ")} د.ج`;
}

export function formatOrderDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("ar-DZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOrderRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `اليوم، ${date.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}`;
  }

  if (days === 1) {
    return "أمس";
  }

  return `منذ ${days} أيام`;
}

export function getDeliveryLabel(type: "home" | "desk") {
  return type === "home" ? "توصيل منزلي" : "مكتب التوصيل";
}
