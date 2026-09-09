export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterday(today: string): string {
  const d = new Date(today + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

// Returns the first day of the week containing the given date.
// weekStartsOnMonday kommt aus AppSettings (Standard: true).
export function getWeekStart(date: string, weekStartsOnMonday: boolean = true): string {
  const d = new Date(date + 'T12:00:00');
  const day = d.getDay(); // 0=Sunday ... 6=Saturday
  const daysBack = weekStartsOnMonday ? (day === 0 ? 6 : day - 1) : day;
  d.setDate(d.getDate() - daysBack);
  return getLocalDateString(d);
}

// Prüft ob date der letzte Tag der Woche ist (Sonntag oder Samstag, je nach Einstellung).
export function isLastDayOfWeek(date: string, weekStartsOnMonday: boolean = true): boolean {
  const d = new Date(date + 'T12:00:00');
  const day = d.getDay();
  return weekStartsOnMonday ? day === 0 : day === 6;
}
