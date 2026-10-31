const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "always" });
const calendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
});

export function formatReviewDate(date: string, now = new Date()): string {
  const parts = calendar.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((entry) => entry.type === type)?.value);
  const today = Date.UTC(part("year"), part("month") - 1, part("day"));
  const elapsed = Math.max(0, Math.floor((today - Date.parse(`${date}T00:00:00Z`)) / 86_400_000));
  if (elapsed === 0) return "hoje";
  if (elapsed < 7) return relative.format(-elapsed, "day");
  if (elapsed < 30) return relative.format(-Math.floor(elapsed / 7), "week");
  if (elapsed < 365) return relative.format(-Math.max(1, Math.round(elapsed / 30.4375)), "month");
  return relative.format(-Math.max(1, Math.round(elapsed / 365.25)), "year");
}
