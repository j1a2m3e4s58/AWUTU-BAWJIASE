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

const emptyKing = {
  name: '', title: '', photo_url: '', biography: '', reign_start: '', reign_end: '',
  birth_date: '', death_date: '', achievements: [], family_line: '', status: 'deceased',
  role_group: 'king', stool_role: '', summary: '', lineage_link: '', gallery_ids: '', related_event_ids: '', related_announcement_ids: '',
  order: 0, is_late_king: false, featured: false, content_status: 'draft', published: false,
};

export default function AdminKings() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyKing);
  const [achievementInput, setAchievementInput] = useState('');
  const queryClient = useQueryClient();

  const { data: kings, isLoading } = useQuery({
    queryKey: ['admin-kings'],
    queryFn: () => firebaseApi.entities.King.list('order'),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (d) => firebaseApi.entities.King.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-kings'] }); setEditing(null); toast.success('King created'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.King.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-kings'] }); setEditing(null); toast.success('King updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.King.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-kings'] }); toast.success('King deleted'); },
  });

  const openCreate = () => { setForm({ ...emptyKing }); setEditing('new'); };
  const openEdit = (king) => {
    setForm({
      ...emptyKing,
      ...king,
      gallery_ids: Array.isArray(king.gallery_ids) ? king.gallery_ids.join(', ') : '',
      related_event_ids: Array.isArray(king.related_event_ids) ? king.related_event_ids.join(', ') : '',
      related_announcement_ids: Array.isArray(king.related_announcement_ids) ? king.related_announcement_ids.join(', ') : '',
    });
    setEditing(king.id);
  };

  const handleSave = () => {
    if (!form.name) return;
    const payload = {
      ...form,
      gallery_ids: typeof form.gallery_ids === 'string' ? form.gallery_ids.split(',').map((item) => item.trim()).filter(Boolean) : form.gallery_ids,
      related_event_ids: typeof form.related_event_ids === 'string' ? form.related_event_ids.split(',').map((item) => item.trim()).filter(Boolean) : form.related_event_ids,
      related_announcement_ids: typeof form.related_announcement_ids === 'string' ? form.related_announcement_ids.split(',').map((item) => item.trim()).filter(Boolean) : form.related_announcement_ids,
      published: form.content_status === 'published',
    };
    if (editing === 'new') {
      createMut.mutate(payload);
    } else {
      updateMut.mutate({ id: editing, data: payload });
    }
  };

  const addAchievement = () => {
    if (!achievementInput.trim()) return;
    setForm({ ...form, achievements: [...(form.achievements || []), achievementInput.trim()] });
    setAchievementInput('');
  };

  const removeAchievement = (idx) => {
    setForm({ ...form, achievements: form.achievements.filter((_, i) => i !== idx) });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await firebaseApi.integrations.Core.UploadFile({ file });
    setForm({ ...form, photo_url: file_url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Leadership Manager</h2>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Leader
        </Button>
      </div>

      <div className="space-y-2">
        {kings.map((king) => (
          <div key={king.id} className="flex items-center gap-4 p-4 bg-sidebar-accent rounded-lg border border-sidebar-border">
            {king.photo_url && (
              <img src={king.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{king.name}</p>
                {king.published ? (
                  <Eye className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-sidebar-foreground/40" />
                )}
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                {(king.role_group || 'king').replace(/_/g, ' ')} · {king.status} · Order: {king.order}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {king.content_status && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{king.content_status}</span>}
                {king.featured && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-primary/30 px-2 py-1 text-sidebar-primary">Featured</span>}
                {king.stool_role && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{king.stool_role}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(king)} className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(king.id)} className="h-8 w-8 text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {kings.length === 0 && !isLoading && (
          <p className="text-center text-sidebar-foreground/50 py-8">No kings added yet.</p>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing === 'new' ? 'Add Leader' : 'Edit Leader'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Role Group</Label>
                <Select value={form.role_group} onValueChange={(v) => setForm({ ...form, role_group: v })}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="king">King</SelectItem>
                    <SelectItem value="chief">Chief</SelectItem>
                    <SelectItem value="queen_mother">Queen Mother</SelectItem>
                    <SelectItem value="elder">Elder</SelectItem>
                    <SelectItem value="council_member">Council Member</SelectItem>
                    <SelectItem value="important_figure">Important Figure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Stool / Role</Label>
                <Input value={form.stool_role} onChange={(e) => setForm({ ...form, stool_role: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Public Summary</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              <p className="text-xs text-sidebar-foreground/45 mt-1">{(form.summary || '').length}/220 suggested for card summary</p>
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Photo</Label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm text-sidebar-foreground/70 mt-1" />
              {form.photo_url && (
                <img src={form.photo_url} alt="" className="w-20 h-20 rounded object-cover mt-2" />
              )}
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Biography</Label>
              <Textarea value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} rows={5} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Reign Start</Label>
                <Input type="date" value={form.reign_start} onChange={(e) => setForm({ ...form, reign_start: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Reign End</Label>
                <Input type="date" value={form.reign_end} onChange={(e) => setForm({ ...form, reign_end: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Birth Date</Label>
                <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Death Date</Label>
                <Input type="date" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reigning">Reigning</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                    <SelectItem value="abdicated">Abdicated</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Family Line</Label>
              <Input value={form.family_line} onChange={(e) => setForm({ ...form, family_line: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Lineage Link</Label>
              <Input value={form.lineage_link} onChange={(e) => setForm({ ...form, lineage_link: e.target.value })} placeholder="/lineage or a short reference" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sidebar-foreground/70">Related Gallery Item IDs</Label>
                <Input value={form.gallery_ids} onChange={(e) => setForm({ ...form, gallery_ids: e.target.value })} placeholder="comma-separated ids" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Related Event IDs</Label>
                <Input value={form.related_event_ids} onChange={(e) => setForm({ ...form, related_event_ids: e.target.value })} placeholder="comma-separated ids" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground/70">Related Announcement IDs</Label>
                <Input value={form.related_announcement_ids} onChange={(e) => setForm({ ...form, related_announcement_ids: e.target.value })} placeholder="comma-separated ids" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Achievements</Label>
              <div className="flex gap-2 mt-1">
                <Input value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} placeholder="Add achievement" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
                <Button type="button" onClick={addAchievement} size="sm">Add</Button>
              </div>
              {form.achievements?.map((a, i) => (
                <div key={i} className="flex items-center gap-2 mt-2 text-sm text-sidebar-foreground/80">
                  <span className="flex-1">• {a}</span>
                  <button onClick={() => removeAchievement(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label className="text-sidebar-foreground/70">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label className="text-sidebar-foreground/70">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_late_king} onCheckedChange={(v) => setForm({ ...form, is_late_king: v })} />
                <Label className="text-sidebar-foreground/70">Late King (Memorial)</Label>
              </div>
            </div>

            <div>
              <Label className="text-sidebar-foreground/70">Content Status</Label>
              <Select value={form.content_status} onValueChange={(v) => setForm({ ...form, content_status: v, published: v === 'published' })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                  <SelectValue />
                </SelectTrigger>
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
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {editing === 'new' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

