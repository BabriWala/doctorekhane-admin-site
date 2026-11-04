"use client";
import { useEffect, useRef, useState } from "react";

export const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
export function readableDate(value) {
  return value ? new Date(String(value).slice(0, 10) + "T12:00:00").toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) : "তথ্য নেই";
}

export default function DateSelect({ value = "", onChange, label, required = false, min = "1900-01-01", max, disabled = false, locale = "bn-BD" }) {
  const upper = max || (Number(todayISO().slice(0, 4)) + 10) + "-12-31";
  const split = v => { const [year = "", month = "", day = ""] = String(v || "").slice(0, 10).split("-"); return { year, month, day }; };
  const [parts, setParts] = useState(() => split(value));
  const [error, setError] = useState("");
  const yearRef = useRef(null);
  useEffect(() => { setParts(split(value)); setError(""); yearRef.current?.setCustomValidity(""); }, [value]);
  const days = new Date(Number(parts.year) || 2000, Number(parts.month) || 1, 0).getDate();
  const update = (field, v) => {
    const next = { ...parts, [field]: v };
    const count = new Date(Number(next.year) || 2000, Number(next.month) || 1, 0).getDate();
    if (Number(next.day) > count) next.day = String(count).padStart(2, "0");
    setParts(next);
    if (next.year && next.month && next.day) {
      const date = next.year + "-" + next.month + "-" + next.day;
      const invalid = date < min || date > upper;
      const message = invalid ? (locale === "bn-BD" ? "সঠিক তারিখ নির্বাচন করুন।" : "Choose a date within the allowed range.") : "";
      setError(message); yearRef.current?.setCustomValidity(message);
      if (!invalid) onChange(date);
    }
  };
  const style = "h-11 min-w-0 w-full rounded-md border bg-white px-2 text-base text-slate-900";
  return <div role="group" aria-label={label} className="mt-2">
    <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2">
      <select className={style} aria-label={label + " day"} required={required || Boolean(parts.day || parts.month || parts.year)} disabled={disabled} value={parts.day} onChange={e => update("day", e.target.value)}><option value="" disabled>{locale === "bn-BD" ? "দিন" : "Day"}</option>{Array.from({ length: days }, (_, i) => <option key={i} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>)}</select>
      <select className={style} aria-label={label + " month"} required={required || Boolean(parts.day || parts.month || parts.year)} disabled={disabled} value={parts.month} onChange={e => update("month", e.target.value)}><option value="" disabled>{locale === "bn-BD" ? "মাস" : "Month"}</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1).padStart(2, "0")}>{new Date(2000, i, 1).toLocaleDateString(locale, { month: "long" })}</option>)}</select>
      <select ref={yearRef} className={style} aria-label={label + " year"} required={required || Boolean(parts.day || parts.month || parts.year)} disabled={disabled} value={parts.year} onChange={e => update("year", e.target.value)}><option value="" disabled>{locale === "bn-BD" ? "বছর" : "Year"}</option>{Array.from({ length: Number(upper.slice(0, 4)) - Number(min.slice(0, 4)) + 1 }, (_, i) => Number(upper.slice(0, 4)) - i).map(year => <option key={year} value={year}>{year}</option>)}</select>
    </div>
    {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    {!required && (value || parts.day || parts.month || parts.year) && <button type="button" className="mt-1 text-sm underline" disabled={disabled} onClick={() => { setParts(split("")); setError(""); yearRef.current?.setCustomValidity(""); onChange(""); }}>Clear date</button>}
  </div>;
}
