export function formatTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return value || "—";
  const hour = Number(match[1]);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

export function formatTimeRange(value) {
  return String(value || "").replace(/\b(\d{1,2}):(\d{2})(?:\s*([AP]M))?\b/gi,
    (match, hour, minute, period) => period ? match : formatTime(`${hour}:${minute}`));
}

export function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value || "—") : date.toLocaleString("en-US", { hour12: true });
}

export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(String(value || "").trim());
  if (!match) throw new Error("Enter visiting times as hh:mm AM/PM, for example 09:00 AM.");
  let hour = Number(match[1]);
  if (Number(match[2]) > 59 || (match[3] ? hour < 1 || hour > 12 : hour > 23)) {
    throw new Error("Enter a valid visiting time, for example 09:00 AM.");
  }
  if (match[3]) hour = hour % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}
