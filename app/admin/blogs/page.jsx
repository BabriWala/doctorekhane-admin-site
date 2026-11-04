// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";
import { safeLink } from "@/lib/blog-links";
import { PaginationBar } from "@/components/ui/pagination-bar";
import RecordView from "@/components/RecordView";

import { useEffect, useState, useRef } from "react";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const blank = { title: "", summary: "", content: "", category: "", tagsText: "", authorName: "Doctor Ekhane Medical Team", thumbnail: "", status: "draft", featured: false, order: "" };

export default function BlogsAdminPage() {
  const contentRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [orders, setOrders] = useState({});
  const [savingOrder, setSavingOrder] = useState(null);
  const addLink = () => {
    const href = safeLink(linkUrl);
    if (!href || !linkText.trim()) { toast.error("Enter link text and a valid https:// URL or /site-path."); return; }
    const { start, end } = selectionRef.current;
    const label = linkText.trim().replace(/[\[\]\n]/g, " ");
    const markup = "[" + label + "](" + href.replace(/\(/g, "%28").replace(/\)/g, "%29") + ")";
    change("content", form.content.slice(0, start) + markup + form.content.slice(end));
    setLinkText(""); setLinkUrl("");
    selectionRef.current = { start: start + markup.length, end: start + markup.length };
    contentRef.current?.focus();
  };
  const saveOrder = async (post) => {
    const order = Number(orders[post._id] ?? post.order);
    if (!Number.isInteger(order) || order < 1) { toast.error("Order must be a positive whole number."); return; }
    setSavingOrder(post._id);
    try { await api.put("/blogs/" + post._id, { order }); await load(); toast.success("Display order saved"); }
    catch { toast.error("Could not save display order"); } finally { setSavingOrder(null); }
  };
  const [items, setItems] = useState([]); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [busy, setBusy] = useState(false); const [search, setSearch] = useState("");
  const load = async () => { try { const { data } = await api.get("/blogs/admin", { params: { page, limit: 20, search: search || undefined } }); setItems(data.data || []); setPagination(data.pagination); setOrders({}); } catch (error) { toast.error(error.response?.data?.message || "Blog posts could not be loaded"); } };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search, page]);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (post) => { setEditing(post._id); selectionRef.current = { start: post.content.length, end: post.content.length }; setForm({ ...post, order: post.order ?? "", tagsText: (post.tags || []).join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const reset = () => { setEditing(null); setForm(blank); setLinkText(""); setLinkUrl(""); selectionRef.current = { start: 0, end: 0 }; };
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { const payload = { ...form, tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) }; delete payload.tagsText; if (payload.order === "") delete payload.order; else payload.order = Number(payload.order); if (editing) await api.put(`/blogs/${editing}`, payload); else await api.post("/blogs", payload); toast.success(editing ? "Blog post updated" : "Blog post created"); reset(); await load(); } catch (error) { toast.error(error.response?.data?.message || "Blog post could not be saved"); } finally { setBusy(false); } };
  const remove = async (post) => { if (!window.confirm(`Delete “${post.title}”?`)) return; try { await api.delete(`/blogs/${post._id}`); toast.success("Blog post deleted"); await load(); } catch (error) { toast.error(error.response?.data?.message || "Blog post could not be deleted"); } };
  const togglePublish = async (post) => { try { await api.put(`/blogs/${post._id}`, { status: post.status === "published" ? "draft" : "published" }); await load(); toast.success(post.status === "published" ? "Post unpublished" : "Post published"); } catch (error) { toast.error(error.response?.data?.message || "Status could not be changed"); } };
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Health Blog CMS</h1><p className="text-muted-foreground">Create, edit, publish, unpublish, and remove health articles.</p></div>
    <Card><CardHeader><CardTitle>{editing ? "Edit article" : "New article"}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <div><Label>Title <span className="text-red-600">*</span></Label><Input required value={form.title} onChange={(e) => change("title", e.target.value)} /></div><div><Label>Category <span className="text-red-600">*</span></Label><Input required value={form.category} onChange={(e) => change("category", e.target.value)} /></div>
      <div><Label>Author <span className="text-red-600">*</span></Label><Input required value={form.authorName} onChange={(e) => change("authorName", e.target.value)} /></div><div><Label>Thumbnail URL/path</Label><Input value={form.thumbnail || ""} onChange={(e) => change("thumbnail", e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Summary <span className="text-red-600">*</span></Label><Textarea required minLength={10} value={form.summary} onChange={(e) => change("summary", e.target.value)} /></div><div className="md:col-span-2"><Label>Content <span className="text-red-600">*</span></Label><Textarea ref={contentRef} onSelect={e => { selectionRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd }; if (e.target.selectionStart !== e.target.selectionEnd) setLinkText(e.target.value.slice(e.target.selectionStart, e.target.selectionEnd)); }} required minLength={20} rows={10} value={form.content} onChange={(e) => change("content", e.target.value)} /></div>
      <div className="md:col-span-2 rounded-md border p-3"><p className="mb-2 text-sm">Select text in the content, then add its link.</p><div className="grid gap-2 sm:grid-cols-3"><Input aria-label="Link text" placeholder="Link text" value={linkText} onChange={e => setLinkText(e.target.value)} /><Input aria-label="Link URL" placeholder="https://example.com or /doctors" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} /><Button type="button" variant="outline" onClick={addLink}>Insert link</Button></div></div>
      <div><Label>Display order (smaller numbers appear first)</Label><Input type="number" min="1" step="1" value={form.order ?? ""} onChange={e => change("order", e.target.value)} placeholder="Automatic" /></div>
      <div><Label>Tags</Label><Input placeholder="heart, prevention" value={form.tagsText || ""} onChange={(e) => change("tagsText", e.target.value)} /></div><div><Label>Status</Label><select className="h-10 w-full rounded-md border bg-white px-3" value={form.status} onChange={(e) => change("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => change("featured", e.target.checked)} /> Featured article</label><div className="flex justify-end gap-2"><Button type="submit" disabled={busy}>{editing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{editing ? "Save changes" : "Create post"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}><X className="mr-2 h-4 w-4" />Cancel</Button>}</div>
    </form></CardContent></Card>
    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">All posts ({pagination?.totalItems ?? items.length})</h2><Input className="max-w-xs" placeholder="Search posts" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
    <div className="grid gap-3">{items.map((post, index) => <Card key={post._id}><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="font-semibold">{(page - 1) * 20 + index + 1}. {post.title}</p><p className="text-sm text-muted-foreground">{post.category} · {post.status} · {post.views || 0} views</p></div><div className="flex items-end gap-2"><label className="text-xs">Display order<Input aria-label={"Order for " + post.title} className="w-24" type="number" min="1" step="1" value={orders[post._id] ?? post.order ?? ""} onChange={e => setOrders(current => ({ ...current, [post._id]: e.target.value }))} /></label><Button size="sm" disabled={savingOrder === post._id} onClick={() => saveOrder(post)}>Save order</Button></div><RecordView record={post} title="Article details" /><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => togglePublish(post)}>{post.status === "published" ? "Unpublish" : "Publish"}</Button><Button size="sm" onClick={() => edit(post)}><Edit className="mr-1 h-4 w-4" />Edit</Button><Button size="sm" variant="destructive" onClick={() => remove(post)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div></CardContent></Card>)}{!items.length && <p className="rounded border p-8 text-center text-muted-foreground">No blog posts found.</p>}</div>
    <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
  </div>;
}
