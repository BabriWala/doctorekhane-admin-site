// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReviewsPage() {
  const [status, setStatus] = useState("pending");
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", status],
    queryFn: async () => (await api.get("/reviews", { params: status === "all" ? {} : { status } })).data.data,
  });
  const update = async (id, nextStatus) => {
    try {
      await api.patch(`/reviews/${id}`, { status: nextStatus, verified: nextStatus === "approved" });
      toast.success(`Review ${nextStatus}`);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error) { toast.error(error.response?.data?.message || "Could not update review"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try { await api.delete(`/reviews/${id}`); toast.success("Review deleted"); queryClient.invalidateQueries({ queryKey: ["reviews"] }); }
    catch (error) { toast.error(error.response?.data?.message || "Could not delete review"); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Review Moderation</h1><p className="text-muted-foreground">Approve genuine patient feedback before it appears publicly.</p></div>
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="all">All reviews</SelectItem></SelectContent></Select>
    </div>
    {isLoading ? <p>Loading reviews…</p> : reviews.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No {status === "all" ? "" : status} reviews found.</CardContent></Card> : <div className="grid gap-4">
      {reviews.map((review) => <Card key={review._id}><CardHeader className="pb-3"><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-lg">{review.title || "Patient review"}</CardTitle><p className="text-sm text-muted-foreground">{review.patientName} · {review.targetType} · {new Date(review.createdAt).toLocaleDateString()}</p></div><Badge variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"}>{review.status}</Badge></div></CardHeader><CardContent className="space-y-4"><div className="flex gap-1">{[1,2,3,4,5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</div><p className="leading-relaxed">{review.comment}</p>{review.treatmentType && <p className="text-sm text-muted-foreground">Treatment: {review.treatmentType}</p>}<div className="flex flex-wrap gap-2">{review.status !== "approved" && <Button size="sm" onClick={() => update(review._id, "approved")}><Check className="mr-2 h-4 w-4" />Approve</Button>}{review.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => update(review._id, "rejected")}><X className="mr-2 h-4 w-4" />Reject</Button>}<Button size="sm" variant="destructive" onClick={() => remove(review._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div></CardContent></Card>)}
    </div>}
  </div>;
}
