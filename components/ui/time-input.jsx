"use client";

// Preserve HH:mm storage while always presenting an explicit AM/PM clock.
export function TimeInput({ value = "", onChange, onBlur, label, inputRef, disabled }) {
  const [hour24, minute = "00"] = value.split(":");
  const period = Number(hour24) >= 12 ? "PM" : "AM";
  const hour = value ? String(Number(hour24) % 12 || 12) : "";
  const update = (h, m, p) => onChange(String(Number(h) % 12 + (p === "PM" ? 12 : 0)).padStart(2, "0") + ":" + m);
  const style = "h-11 min-w-0 w-full rounded-md border bg-background px-2 text-base";
  return <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
    <select ref={inputRef} aria-label={label + " hour"} className={style} value={hour} onBlur={onBlur} disabled={disabled} required onChange={e => update(e.target.value, minute, period)}>
      <option value="" disabled>Hour</option>
      {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
    </select>
    <select aria-label={label + " minute"} className={style} value={minute} onBlur={onBlur} disabled={disabled || !value} onChange={e => update(hour, e.target.value, period)}>
      {Array.from({ length: 60 }, (_, i) => <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>)}
    </select>
    <select aria-label={label + " AM or PM"} className={style} value={period} onBlur={onBlur} disabled={disabled || !value} onChange={e => update(hour, minute, e.target.value)}>
      <option value="AM">AM</option><option value="PM">PM</option>
    </select>
  </div>;
}
