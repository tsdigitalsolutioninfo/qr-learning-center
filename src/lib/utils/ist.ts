// Reporting calendar is Asia/Kolkata (UTC+05:30, no DST).
const IST_MS = 5.5 * 3600e3;
export function istDayRange(offsetDays = 0) {
  const n = new Date(Date.now() + IST_MS);
  const startUtc = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + offsetDays) - IST_MS;
  return { start: new Date(startUtc).toISOString(), end: new Date(startUtc + 86400e3).toISOString() };
}
export const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '—';
/** Converts a <input type="datetime-local"> value (interpreted as IST) to an ISO string, or null if invalid. */
export function istInputToIso(v: string): string | null {
  const d = new Date(`${v}:00+05:30`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
