export function safeLink(url) {
  const value = String(url || "").trim();
  if (!value || /[\s\\]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try { const parsed = new URL(value); return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null; } catch { return null; }
}
