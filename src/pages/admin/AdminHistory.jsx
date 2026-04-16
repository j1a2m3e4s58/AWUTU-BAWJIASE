import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const emptyContent = { title: '', content: '', section: 'community_history', story_type: '', timeline_date: '', order: 0, image_url: '', featured: false, content_status: 'draft', published: false };

export default function AdminHistory() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyContent);
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-history'],
    queryFn: () => firebaseApi.entities.HistoryContent.list('order'),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (d) => firebaseApi.entities.HistoryContent.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history'] }); setEditing(null); toast.success('Created'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.HistoryContent.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history'] }); setEditing(null); toast.success('Updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.HistoryContent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-history'] }); toast.success('Deleted'); },
  });

  const openCreate = () => { setForm({ ...emptyContent }); setEditing('new'); };
  const openEdit = (item) => { setForm({ ...emptyContent, ...item }); setEditing(item.id); };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    const payload = { ...form, published: form.content_status === 'published' };
    if (editing === 'new') createMut.mutate(payload);
    else updateMut.mutate({ id: editing, data: payload });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await firebaseApi.integrations.Core.UploadFile({ file });
    setForm({ ...form, image_url: file_url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">History & Stories</h2>
        <Button onClick={openCreate} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Content</Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-sidebar-accent rounded-lg border border-sidebar-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{item.title}</p>
                {item.published ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-sidebar-foreground/40" />}
              </div>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{item.section?.replace(/_/g, ' ')} · Order: {item.order}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No content yet.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader><DialogTitle className="font-display">{editing === 'new' ? 'Add Content' : 'Edit Content'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sidebar-foreground/70">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community_history">Community History</SelectItem>
                    <SelectItem value="about">About</SelectItem>
                    <SelectItem value="funeral_info">Funeral Info</SelectItem>
                    <SelectItem value="heritage_story">Heritage Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Story Type</Label>
                <Input value={form.story_type} onChange={(e) => setForm({ ...form, story_type: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Timeline Date</Label>
                <Input type="date" value={form.timeline_date} onChange={(e) => setForm({ ...form, timeline_date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Content *</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Image</Label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-sidebar-foreground/70 mt-1" />
              {form.image_url && <img src={form.image_url} alt="" className="w-20 h-20 rounded object-cover mt-2" />}
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label className="text-sidebar-foreground/70">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label className="text-sidebar-foreground/70">Featured Story</Label>
              </div>
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Content Status</Label>
              <Select value={form.content_status} onValueChange={(v) => setForm({ ...form, content_status: v, published: v === 'published' })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="border-sidebar-border text-sidebar-foreground">Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
