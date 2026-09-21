"use client";

import { useEffect, useState } from "react";
import { formatTimeRange, formatDateTime } from "@/lib/time";
import { Eye } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const hiddenField = /password|token|secret|otp|^__v$/i;
const labelOf = key => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^./, letter => letter.toUpperCase());

function Details({ value, field = "" }) {
  if (value == null || value === "") return <span className="text-muted-foreground">Not provided</span>;
  if (Array.isArray(value)) return value.length ? <div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-lg border p-3"><Details value={item} field={field} /></div>)}</div> : <span className="text-muted-foreground">None</span>;
  if (typeof value === "object") return <dl className="grid gap-4 sm:grid-cols-2">{Object.entries(value).filter(([key]) => !hiddenField.test(key)).map(([key, item]) => <div key={key} className={typeof item === "object" ? "min-w-0 sm:col-span-2" : "min-w-0"}><dt className="mb-1 text-sm font-semibold text-sky-800">{labelOf(key)}</dt><dd className="whitespace-pre-wrap break-words text-sm"><Details value={item} field={key} /></dd></div>)}</dl>;
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (/profilePicture|profilePhoto|logo|thumbnail|images/i.test(field) && typeof value === "string" && /^(https?:\/\/|\/uploads\/)/i.test(value)) {
    const src = value.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || ""}${value}` : value;
    return <div><img src={src} alt={labelOf(field)} className="mb-2 max-h-56 max-w-full rounded-lg object-contain" /><span>{value}</span></div>;
  }
  if (typeof value === "string" && /^(from|to|open|close|timeSlot|time)$/i.test(field)) return <span>{formatTimeRange(value)}</span>;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return <span>{formatDateTime(value)}</span>;
  return <span>{String(value)}</span>;
}

export default function RecordView({ endpoint, record, title = "Record details", children }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setError("");
    if (!endpoint) { setData(record); setLoading(false); return; }
    setLoading(true); setData(null);
    api.get(endpoint).then(({ data: response }) => {
      if (active) setData(response.data || response.doctor || response.hospital || response.donor || response.ambulance || response.user || response);
    }).catch(() => { if (active) setError("Could not load details. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, endpoint, record, retry]);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>
    {children ? <button type="button" className="text-left font-medium text-sky-700 hover:underline focus-visible:outline-2">{children}</button> : <Button type="button" variant="outline" size="sm"><Eye className="mr-1 h-4 w-4" />View</Button>}
  </DialogTrigger><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Read-only record details</DialogDescription></DialogHeader>
    {loading ? <p role="status">Loading details…</p> : error ? <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div> : <Details value={data} />}
  </DialogContent></Dialog>;
}
