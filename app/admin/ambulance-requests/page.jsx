// @ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Phone, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["pending", "assigned", "dispatched", "completed", "cancelled"];

export default function AmbulanceRequestsPage() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({ queryKey: ["ambulance-requests", filter], queryFn: async () => (await api.get("/ambulance-requests", { params: filter === "all" ? {} : { status: filter } })).data.data });
  const updateStatus = async (id, status) => { try { await api.patch(`/ambulance-requests/${id}`, { status }); toast.success("Request updated"); queryClient.invalidateQueries({ queryKey: ["ambulance-requests"] }); } catch (error) { toast.error(error.response?.data?.message || "Update failed"); } };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Ambulance Requests</h1><p className="text-muted-foreground">Dispatch and track customer ambulance requests.</p></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All requests</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
    {isLoading ? <p>Loading requests…</p> : !requests.length ? <Card><CardContent className="py-12 text-center text-muted-foreground">No ambulance requests found.</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-2">{requests.map((request) => <Card key={request._id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">{request.requestNumber}</CardTitle><p className="text-sm text-muted-foreground">{request.serviceType} ambulance</p></div><Badge variant={request.status === "cancelled" ? "destructive" : request.status === "completed" ? "default" : "secondary"}>{request.status}</Badge></div></CardHeader><CardContent className="space-y-3 text-sm"><p className="flex gap-2"><UserRound className="h-4 w-4 shrink-0" />{request.patientName}</p><p className="flex gap-2"><Phone className="h-4 w-4 shrink-0" />{request.contactNumber}</p><p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{request.pickupLocation} → {request.dropLocation}</p><p className="flex gap-2"><Calendar className="h-4 w-4 shrink-0" />{new Date(request.scheduledAt).toLocaleString()}</p>{request.ambulance && <p className="flex gap-2"><Truck className="h-4 w-4 shrink-0" />{request.ambulance.basicInfo?.vehicleNumber}</p>}{request.emergencyDetails && <p className="rounded-md bg-muted p-3">{request.emergencyDetails}</p>}<Select value={request.status} onValueChange={(value) => updateStatus(request._id, value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></CardContent></Card>)}</div>}
  </div>;
}
