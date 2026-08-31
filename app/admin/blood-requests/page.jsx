// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { toast } from "sonner";

const statuses = ["pending", "matched", "fulfilled", "cancelled"];
export default function BloodRequestsPage() {
  const [status, setStatus] = useState("all"); const [page, setPage] = useState(1); const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["blood-requests", status, page], queryFn: async () => (await api.get("/blood-requests", { params: { page, limit: 12, status: status === "all" ? undefined : status } })).data });
  const update = async (id, nextStatus) => { try { await api.patch(`/blood-requests/${id}`, { status: nextStatus }); toast.success("Blood request updated"); queryClient.invalidateQueries({ queryKey: ["blood-requests"] }); } catch (error) { toast.error(error.response?.data?.message || "Update failed"); } };
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Blood Requests</h1><p className="text-muted-foreground">Track customer blood needs and fulfillment.</p></div><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All requests</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>{isLoading ? <p>Loading…</p> : <div className="grid gap-4 lg:grid-cols-2">{(data?.data || []).map((item) => <Card key={item._id}><CardHeader><div className="flex justify-between gap-3"><div><CardTitle>{item.requestNumber}</CardTitle><p className="text-sm text-muted-foreground">Required {new Date(item.requiredDate).toLocaleDateString()}</p></div><Badge variant={item.urgency === "critical" ? "destructive" : "secondary"}>{item.urgency}</Badge></div></CardHeader><CardContent className="space-y-3 text-sm"><p><b>Patient:</b> {item.patientName} · {item.bloodGroup}</p><p><b>Hospital:</b> {item.hospital}</p><p><b>Contact:</b> {item.contactNumber}</p><Select value={item.status} onValueChange={(value) => update(item._id, value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></CardContent></Card>)}</div>}<PaginationBar pagination={data?.pagination} page={page} onPageChange={setPage} /></div>;
}
