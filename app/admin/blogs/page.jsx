// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const blank = { title: "", summary: "", content: "", category: "", tagsText: "", authorName: "Doctor Ekhane Medical Team", thumbnail: "", status: "draft", featured: false };

export default function BlogsAdminPage() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [busy, setBusy] = useState(false); const [search, setSearch] = useState("");
  const load = async () => { try { const { data } = await api.get("/blogs/admin", { params: { limit: 50, search: search || undefined } }); setItems(data.data || []); } catch (error) { toast.error(error.response?.data?.message || "Blog posts could not be loaded"); } };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search]);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (post) => { setEditing(post._id); setForm({ ...post, tagsText: (post.tags || []).join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const reset = () => { setEditing(null); setForm(blank); };
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { const payload = { ...form, tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) }; delete payload.tagsText; if (editing) await api.put(`/blogs/${editing}`, payload); else await api.post("/blogs", payload); toast.success(editing ? "Blog post updated" : "Blog post created"); reset(); await load(); } catch (error) { toast.error(error.response?.data?.message || "Blog post could not be saved"); } finally { setBusy(false); } };
  const remove = async (post) => { if (!window.confirm(`Delete “${post.title}”?`)) return; try { await api.delete(`/blogs/${post._id}`); toast.success("Blog post deleted"); await load(); } catch (error) { toast.error(error.response?.data?.message || "Blog post could not be deleted"); } };
  const togglePublish = async (post) => { try { await api.put(`/blogs/${post._id}`, { status: post.status === "published" ? "draft" : "published" }); await load(); toast.success(post.status === "published" ? "Post unpublished" : "Post published"); } catch (error) { toast.error(error.response?.data?.message || "Status could not be changed"); } };
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Health Blog CMS</h1><p className="text-muted-foreground">Create, edit, publish, unpublish, and remove health articles.</p></div>
    <Card><CardHeader><CardTitle>{editing ? "Edit article" : "New article"}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <div><Label>Title <span className="text-red-600">*</span></Label><Input required value={form.title} onChange={(e) => change("title", e.target.value)} /></div><div><Label>Category <span className="text-red-600">*</span></Label><Input required value={form.category} onChange={(e) => change("category", e.target.value)} /></div>
      <div><Label>Author <span className="text-red-600">*</span></Label><Input required value={form.authorName} onChange={(e) => change("authorName", e.target.value)} /></div><div><Label>Thumbnail URL/path</Label><Input value={form.thumbnail || ""} onChange={(e) => change("thumbnail", e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Summary <span className="text-red-600">*</span></Label><Textarea required minLength={10} value={form.summary} onChange={(e) => change("summary", e.target.value)} /></div><div className="md:col-span-2"><Label>Content <span className="text-red-600">*</span></Label><Textarea required minLength={20} rows={10} value={form.content} onChange={(e) => change("content", e.target.value)} /></div>
      <div><Label>Tags</Label><Input placeholder="heart, prevention" value={form.tagsText || ""} onChange={(e) => change("tagsText", e.target.value)} /></div><div><Label>Status</Label><select className="h-10 w-full rounded-md border bg-white px-3" value={form.status} onChange={(e) => change("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => change("featured", e.target.checked)} /> Featured article</label><div className="flex justify-end gap-2"><Button type="submit" disabled={busy}>{editing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{editing ? "Save changes" : "Create post"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}><X className="mr-2 h-4 w-4" />Cancel</Button>}</div>
    </form></CardContent></Card>
    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">All posts ({items.length})</h2><Input className="max-w-xs" placeholder="Search posts" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    <div className="grid gap-3">{items.map((post) => <Card key={post._id}><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{post.title}</p><p className="text-sm text-muted-foreground">{post.category} · {post.status} · {post.views || 0} views</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => togglePublish(post)}>{post.status === "published" ? "Unpublish" : "Publish"}</Button><Button size="sm" onClick={() => edit(post)}><Edit className="mr-1 h-4 w-4" />Edit</Button><Button size="sm" variant="destructive" onClick={() => remove(post)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div></CardContent></Card>)}{!items.length && <p className="rounded border p-8 text-center text-muted-foreground">No blog posts found.</p>}</div>
  </div>;
}
