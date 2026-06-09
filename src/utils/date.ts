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

// Returns the Monday of the week containing the given date.
// Configurable via the settings screen later (Mo vs. So as week start).
export function getWeekStart(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const day = d.getDay(); // 0=Sunday
  const daysBack = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysBack);
  return getLocalDateString(d);
}
