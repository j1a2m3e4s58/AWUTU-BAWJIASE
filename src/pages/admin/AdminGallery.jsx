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
import MediaUploader from '../../components/shared/MediaUploader';
import BilingualFieldHelper from '@/components/admin/BilingualFieldHelper';

const emptyItem = { title: '', title_twi: '', caption: '', caption_twi: '', description: '', description_twi: '', album: '', tags: '', featured: false, image_url: '', category: 'other', published: false };

export default function AdminGallery() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => firebaseApi.entities.GalleryItem.list('-created_date'),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (d) => firebaseApi.entities.GalleryItem.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); setEditing(null); toast.success('Created'); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.GalleryItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); setEditing(null); toast.success('Updated'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.GalleryItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); toast.success('Deleted'); },
  });

  const handleSave = () => {
    if (!form.title || !form.image_url || !form.caption) return;
    const payload = {
      ...form,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : form.tags,
    };
    if (editing === 'new') createMut.mutate(payload);
    else updateMut.mutate({ id: editing, data: payload });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Gallery</h2>
        <Button onClick={() => { setForm({ ...emptyItem }); setEditing('new'); }} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden group relative">
            <div className="aspect-square">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-sidebar-foreground truncate flex-1">{item.title}</p>
                {item.published ? <Eye className="w-3 h-3 text-green-400" /> : <EyeOff className="w-3 h-3 text-sidebar-foreground/40" />}
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" onClick={() => { setForm({ ...emptyItem, ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '' }); setEditing(item.id); }} className="h-7 w-7"><Pencil className="w-3 h-3" /></Button>
              <Button variant="secondary" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-7 w-7 text-red-400"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No gallery items.</p>}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader><DialogTitle className="font-display">{editing === 'new' ? 'Add Gallery Item' : 'Edit Gallery Item'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sidebar-foreground/70">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Title (Twi)</Label><Input value={form.title_twi || ''} onChange={(e) => setForm({ ...form, title_twi: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.title} targetValue={form.title_twi} onUseDraft={() => setForm({ ...form, title_twi: form.title })} onClear={() => setForm({ ...form, title_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Caption *</Label><Textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={2} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Caption (Twi)</Label><Textarea value={form.caption_twi || ''} onChange={(e) => setForm({ ...form, caption_twi: e.target.value })} rows={2} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.caption} targetValue={form.caption_twi} onUseDraft={() => setForm({ ...form, caption_twi: form.caption })} onClear={() => setForm({ ...form, caption_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Description (Twi)</Label><Textarea value={form.description_twi || ''} onChange={(e) => setForm({ ...form, description_twi: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.description} targetValue={form.description_twi} onUseDraft={() => setForm({ ...form, description_twi: form.description })} onClear={() => setForm({ ...form, description_twi: '' })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Album</Label><Input value={form.album || ''} onChange={(e) => setForm({ ...form, album: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">Tags</Label><Input value={form.tags || ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="festival, chiefs, funeral" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div>
              <MediaUploader
                label="Image *"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                accept="image/*"
                mediaType="image"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="royal_portraits">Royal Portraits</SelectItem>
                  <SelectItem value="ceremonies">Ceremonies</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="funeral">Funeral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sidebar-foreground/70">Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={Boolean(form.featured)} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label className="text-sidebar-foreground/70">Featured Image</Label></div>
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
