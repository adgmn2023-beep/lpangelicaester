import type { OpeningHour } from "@/config/site";

export function groupOpeningHours(hours: readonly OpeningHour[]) {
  const groups: { first: OpeningHour; last: OpeningHour }[] = [];
  const ordered = hours.filter(hour => hour.confirmed).sort((a, b) => (a.dayIndex || 7) - (b.dayIndex || 7));
  for (const hour of ordered) {
    const previous = groups.at(-1);
    if (previous && (hour.dayIndex || 7) === (previous.last.dayIndex || 7) + 1
      && !!hour.closed === !!previous.last.closed
      && (hour.closed || (hour.opens === previous.last.opens && hour.closes === previous.last.closes))) {
      previous.last = hour;
    } else {
      groups.push({ first: hour, last: hour });
    }
  }
  // Join confirmed closures across the Sunday/Monday boundary of the week.
  const first = groups[0];
  const last = groups.at(-1);
  if (groups.length > 1 && first.first.dayIndex === 1 && last?.last.dayIndex === 0 && first.first.closed && last.last.closed) {
    last.last = first.last;
    groups.shift();
  }
  return groups.map(({ first, last }) => {
    const connector = first.closed && (last.dayIndex - first.dayIndex + 7) % 7 === 1 ? "e" : "a";
    const days = first === last ? first.label : `${first.label} ${connector} ${last.label.toLocaleLowerCase("pt-BR")}`;
    return `${days}: ${first.closed ? "fechado" : `${first.opens}–${first.closes}`}`;
  });
}
