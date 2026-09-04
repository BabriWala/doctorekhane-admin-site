"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
export default function EntityActions({ resource, id, queryKey, active }) {
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const run = async (remove) => {
    if (remove && !window.confirm("Permanently delete this record? This cannot be undone.")) return;
    setBusy(true);
    try {
      if (remove) await api.delete(`/${resource}/${id}`);
      else await api.put(`/${resource}/${id}/donation-info`, { isActive: !active });
      toast.success(remove ? "Record deleted" : "Availability updated");
      client.invalidateQueries({ queryKey: [queryKey] });
    } catch (error) { toast.error(error.response?.data?.message || "Action failed"); }
    finally { setBusy(false); }
  };
  return <span className="ml-2 inline-flex gap-2">{resource === "blood-donor" && <Button disabled={busy} size="sm" variant="outline" onClick={() => run(false)}>{active ? "Deactivate" : "Activate"}</Button>}<Button disabled={busy} size="sm" variant="destructive" onClick={() => run(true)}>Delete</Button></span>;
}
