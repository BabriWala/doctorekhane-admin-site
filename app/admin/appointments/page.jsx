// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["pending", "confirmed", "completed", "cancelled", "no-show"];
export default function AppointmentsPage() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", filter],
    queryFn: async () => (await api.get("/appointments", { params: filter === "all" ? {} : { status: filter } })).data.data,
  });
  const changeStatus = async (id, status) => {
    try { await api.patch(`/appointments/${id}`, { status }); toast.success("Appointment updated"); queryClient.invalidateQueries({ queryKey: ["appointments"] }); queryClient.invalidateQueries({ queryKey: ["admin-stats"] }); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update appointment"); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Appointments</h1><p className="text-muted-foreground">Confirm and manage patient appointment requests.</p></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All appointments</SelectItem>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select></div>
    {isLoading ? <p>Loading appointments…</p> : appointments.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments found.</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-2">{appointments.map((item) => <Card key={item._id}><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle className="text-lg">{item.doctor?.personalDetails?.firstName} {item.doctor?.personalDetails?.lastName}</CardTitle><Badge variant={item.status === "confirmed" || item.status === "completed" ? "default" : item.status === "cancelled" ? "destructive" : "secondary"}>{item.status}</Badge></div><p className="font-mono text-xs text-muted-foreground">{item.appointmentNumber}</p></CardHeader><CardContent className="space-y-3"><p className="flex items-center gap-2"><UserRound className="h-4 w-4" />{item.patient?.name}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4" />{item.patient?.phone}</p><p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(item.appointmentDate).toLocaleDateString()} at {item.timeSlot}</p>{item.reason && <p className="rounded-md bg-muted p-3 text-sm">{item.reason}</p>}<Select value={item.status} onValueChange={(value) => changeStatus(item._id, value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select></CardContent></Card>)}</div>}
  </div>;
}
