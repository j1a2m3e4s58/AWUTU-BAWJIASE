import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MediaUploader from '../../components/shared/MediaUploader';
import BilingualFieldHelper from '@/components/admin/BilingualFieldHelper';

const empty = { title: '', title_twi: '', content: '', content_twi: '', attachment_url: '', category: 'general', published: false, pinned: false };

export default function AdminAnnouncements() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-ann'],
    queryFn: () => firebaseApi.entities.Announcement.list('-created_date'),
    initialData: [],
  });

  const createMut = useMutation({ mutationFn: (d) => firebaseApi.entities.Announcement.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ann'] }); setEditing(null); toast.success('Created'); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => firebaseApi.entities.Announcement.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ann'] }); setEditing(null); toast.success('Updated'); } });
  const deleteMut = useMutation({ mutationFn: (id) => firebaseApi.entities.Announcement.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ann'] }); toast.success('Deleted'); } });

  const handleSave = () => {
    if (!form.title || !form.content) return;
    if (editing === 'new') createMut.mutate(form);
    else updateMut.mutate({ id: editing, data: form });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Announcements</h2>
        <Button onClick={() => { setForm({ ...empty }); setEditing('new'); }} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-sidebar-accent rounded-lg border border-sidebar-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {item.pinned && <Pin className="w-3 h-3 text-sidebar-primary" />}
                <p className="text-sm font-medium text-sidebar-foreground truncate">{item.title}</p>
                {item.published ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-sidebar-foreground/40" />}
              </div>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{item.category}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm({ ...empty, ...item }); setEditing(item.id); }} className="h-8 w-8 text-sidebar-foreground/70"><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No announcements.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader><DialogTitle className="font-display">{editing === 'new' ? 'Add Announcement' : 'Edit Announcement'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sidebar-foreground/70">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Title (Twi)</Label><Input value={form.title_twi || ''} onChange={(e) => setForm({ ...form, title_twi: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.title} targetValue={form.title_twi} onUseDraft={() => setForm({ ...form, title_twi: form.title })} onClear={() => setForm({ ...form, title_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Content *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Content (Twi)</Label><Textarea value={form.content_twi || ''} onChange={(e) => setForm({ ...form, content_twi: e.target.value })} rows={5} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.content} targetValue={form.content_twi} onUseDraft={() => setForm({ ...form, content_twi: form.content })} onClear={() => setForm({ ...form, content_twi: '' })} />
            <div>
              <MediaUploader
                label="Attachment File"
                value={form.attachment_url}
                onChange={(url) => setForm({ ...form, attachment_url: url })}
                accept="*/*"
                mediaType="file"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="funeral">Funeral</SelectItem>
                  <SelectItem value="royal">Royal</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sidebar-foreground/70">Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} /><Label className="text-sidebar-foreground/70">Pinned</Label></div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEditing(null)} className="border-sidebar-border text-sidebar-foreground">Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
