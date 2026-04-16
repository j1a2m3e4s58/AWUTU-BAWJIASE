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
import BilingualFieldHelper from '@/components/admin/BilingualFieldHelper';

const empty = {
  title: '', title_twi: '', description: '', description_twi: '', date: '', end_date: '', location: '', venue: '', organizer: '', dress_code: '', contact_person: '', contact_phone: '',
  featured_image_url: '', category: 'community', featured: false, content_status: 'draft', published: false,
};

export default function AdminEvents() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => firebaseApi.entities.CommunityEvent.list('-date'),
    initialData: [],
  });

  const createMut = useMutation({ mutationFn: (d) => firebaseApi.entities.CommunityEvent.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Created'); }, onError: (error) => { toast.error(error?.message || 'Failed to save event'); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => firebaseApi.entities.CommunityEvent.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Updated'); }, onError: (error) => { toast.error(error?.message || 'Failed to update event'); } });
  const deleteMut = useMutation({ mutationFn: (id) => firebaseApi.entities.CommunityEvent.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Deleted'); } });

  const handleSave = () => {
    if (!form.title || !form.date) {
      toast.error('Title and start date are required');
      return;
    }
    const payload = { ...form, published: form.content_status === 'published' };
    const optimisticId = editing === 'new' ? `pending-${Date.now()}` : editing;
    qc.setQueryData(['admin-events'], (current = []) => {
      if (editing === 'new') {
        return [{ id: optimisticId, ...payload }, ...current];
      }
      return current.map((item) => (item.id === editing ? { ...item, ...payload } : item));
    });
    setEditing(null);
    if (editing === 'new') createMut.mutate(payload);
    else updateMut.mutate({ id: editing, data: payload });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Event Manager</h2>
        <Button onClick={() => { setForm({ ...empty }); setEditing('new'); }} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-sidebar-accent rounded-lg border border-sidebar-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{item.title}</p>
                {item.published ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-sidebar-foreground/40" />}
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                {item.date && new Date(item.date).toLocaleDateString()} · {item.category}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.content_status && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{item.content_status}</span>}
                {item.featured && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-primary/30 px-2 py-1 text-sidebar-primary">Featured</span>}
                {(item.venue || item.location) && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{item.venue || item.location}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm({ ...empty, ...item }); setEditing(item.id); }} className="h-8 w-8 text-sidebar-foreground/70"><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No events.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader><DialogTitle className="font-display">{editing === 'new' ? 'Add Event' : 'Edit Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sidebar-foreground/70">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Title (Twi)</Label><Input value={form.title_twi || ''} onChange={(e) => setForm({ ...form, title_twi: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.title} targetValue={form.title_twi} onUseDraft={() => setForm({ ...form, title_twi: form.title })} onClear={() => setForm({ ...form, title_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Description (Twi)</Label><Textarea value={form.description_twi || ''} onChange={(e) => setForm({ ...form, description_twi: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.description} targetValue={form.description_twi} onUseDraft={() => setForm({ ...form, description_twi: form.description })} onClear={() => setForm({ ...form, description_twi: '' })} />
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Start Date *</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">End Date</Label><Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Organizer</Label><Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">Dress Code</Label><Input value={form.dress_code} onChange={(e) => setForm({ ...form, dress_code: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Contact Person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">Contact Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div><Label className="text-sidebar-foreground/70">Featured Image URL</Label><Input value={form.featured_image_url} onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div>
              <Label className="text-sidebar-foreground/70">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="funeral">Funeral</SelectItem>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="royal">Royal</SelectItem>
                  <SelectItem value="memorial">Memorial</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="durbur">Durbur</SelectItem>
                  <SelectItem value="public_notice">Public Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sidebar-foreground/70">Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label className="text-sidebar-foreground/70">Featured Event</Label></div>
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

