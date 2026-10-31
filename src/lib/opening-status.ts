import { site, type OpeningHour } from "@/config/site";

const dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const weekdayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const minutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};
const shortTime = (time: string) => time.replace(/^0/, "");

export function getOpeningStatus(now: Date, hours: readonly OpeningHour[], timeZone = site.timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value || "";
  const day = weekdayKeys.indexOf(part("weekday"));
  const time = Number(part("hour")) * 60 + Number(part("minute"));
  const today = hours.find((entry) => entry.dayIndex === day && entry.confirmed);
  if (!today) return null;
  if (!today.closed && time >= minutes(today.opens) && time < minutes(today.closes)) {
    return `Aberto agora · fecha às ${today.closes}`;
  }
  for (let offset = 0; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;
    const next = hours.find((entry) => entry.dayIndex === nextDay && entry.confirmed && !entry.closed);
    if (next && (offset > 0 || time < minutes(next.opens))) {
      return `Fechado agora · abre ${offset === 0 ? "hoje" : dayNames[nextDay]} ${shortTime(next.opens)}`;
    }
  }
  return "Fechado agora";
}
