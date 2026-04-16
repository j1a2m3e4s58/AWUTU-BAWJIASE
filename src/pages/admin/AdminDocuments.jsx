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
  title: '', title_twi: '', description: '', description_twi: '', preview_text: '', preview_text_twi: '', file_url: '', cover_image_url: '', document_date: '', download_label: '',
  tags: '', category: 'other', featured: false, content_status: 'draft', published: false,
};

export default function AdminDocuments() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-docs'],
    queryFn: () => firebaseApi.entities.ArchiveDocument.list('-created_date'),
    initialData: [],
  });

  const createMut = useMutation({ mutationFn: (d) => firebaseApi.entities.ArchiveDocument.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-docs'] }); toast.success('Created'); }, onError: (error) => { toast.error(error?.message || 'Failed to save document'); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => firebaseApi.entities.ArchiveDocument.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-docs'] }); toast.success('Updated'); }, onError: (error) => { toast.error(error?.message || 'Failed to update document'); } });
  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.ArchiveDocument.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['admin-docs'] });
      const previousItems = qc.getQueryData(['admin-docs']);
      qc.setQueryData(['admin-docs'], (current = []) => current.filter((item) => item.id !== id));
      return { previousItems };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-docs'] }); toast.success('Deleted'); },
    onError: (error, _id, context) => {
      if (context?.previousItems) qc.setQueryData(['admin-docs'], context.previousItems);
      toast.error(error?.message || 'Failed to delete document');
    },
  });

  const handleSave = () => {
    if (!form.title || !form.file_url) {
      toast.error('Title and file are required');
      return;
    }
    const payload = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : form.tags,
      published: form.content_status === 'published',
    };
    const optimisticId = editing === 'new' ? `pending-${Date.now()}` : editing;
    qc.setQueryData(['admin-docs'], (current = []) => {
      if (editing === 'new') {
        return [{ id: optimisticId, ...payload }, ...current];
      }
      return current.map((item) => (item.id === editing ? { ...item, ...payload } : item));
    });
    qc.setQueryData(['documents'], (current = []) => {
      if (!payload.published) return current;
      if (editing === 'new') {
        return [{ id: optimisticId, ...payload }, ...current];
      }
      return current.map((item) => (item.id === editing ? { ...item, ...payload } : item));
    });
    setEditing(null);
    if (editing === 'new') createMut.mutate(payload);
    else updateMut.mutate({ id: editing, data: payload });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await firebaseApi.integrations.Core.UploadFile({ file });
    setForm({ ...form, file_url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Documents Center</h2>
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
              <p className="text-xs text-sidebar-foreground/60 capitalize">{item.category?.replace(/_/g, ' ')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.content_status && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{item.content_status}</span>}
                {item.featured && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-primary/30 px-2 py-1 text-sidebar-primary">Featured</span>}
                {item.document_date && <span className="text-[10px] uppercase tracking-[0.14em] border border-sidebar-border px-2 py-1 text-sidebar-foreground/70">{item.document_date}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm({ ...empty, ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '' }); setEditing(item.id); }} className="h-8 w-8 text-sidebar-foreground/70"><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No documents.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader><DialogTitle className="font-display">{editing === 'new' ? 'Add Document' : 'Edit Document'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sidebar-foreground/70">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Title (Twi)</Label><Input value={form.title_twi || ''} onChange={(e) => setForm({ ...form, title_twi: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.title} targetValue={form.title_twi} onUseDraft={() => setForm({ ...form, title_twi: form.title })} onClear={() => setForm({ ...form, title_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Description (Twi)</Label><Textarea value={form.description_twi || ''} onChange={(e) => setForm({ ...form, description_twi: e.target.value })} rows={2} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.description} targetValue={form.description_twi} onUseDraft={() => setForm({ ...form, description_twi: form.description })} onClear={() => setForm({ ...form, description_twi: '' })} />
            <div><Label className="text-sidebar-foreground/70">Preview Text</Label><Textarea value={form.preview_text} onChange={(e) => setForm({ ...form, preview_text: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Preview Text (Twi)</Label><Textarea value={form.preview_text_twi || ''} onChange={(e) => setForm({ ...form, preview_text_twi: e.target.value })} rows={3} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <BilingualFieldHelper sourceValue={form.preview_text} targetValue={form.preview_text_twi} onUseDraft={() => setForm({ ...form, preview_text_twi: form.preview_text })} onClear={() => setForm({ ...form, preview_text_twi: '' })} />
            <div>
              <Label className="text-sidebar-foreground/70">File *</Label>
              <input type="file" onChange={handleUpload} className="text-sm text-sidebar-foreground/70 mt-1" />
              {form.file_url && <p className="text-xs text-green-400 mt-1">File uploaded</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sidebar-foreground/70">Document Date</Label><Input type="date" value={form.document_date} onChange={(e) => setForm({ ...form, document_date: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
              <div><Label className="text-sidebar-foreground/70">Download Label</Label><Input value={form.download_label} onChange={(e) => setForm({ ...form, download_label: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            </div>
            <div><Label className="text-sidebar-foreground/70">Cover Image URL</Label><Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div><Label className="text-sidebar-foreground/70">Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="archives, forms, programme" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" /></div>
            <div>
              <Label className="text-sidebar-foreground/70">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="royal_decree">Royal Decree</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="genealogy">Genealogy</SelectItem>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="chieftaincy_record">Chieftaincy Record</SelectItem>
                  <SelectItem value="funeral_programme">Funeral Programme</SelectItem>
                  <SelectItem value="public_notice">Public Notice</SelectItem>
                  <SelectItem value="forms">Forms</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sidebar-foreground/70">Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label className="text-sidebar-foreground/70">Featured</Label></div>
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
