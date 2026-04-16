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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MediaUploader from '../../components/shared/MediaUploader';

const INITIAL = {
  title: '',
  description: '',
  album: '',
  tags: '',
  video_url: '',
  thumbnail_url: '',
  category: 'other',
  duration: '',
  published: false,
  featured: false,
  order: 0,
};

const CATEGORY_OPTIONS = [
  { value: 'royal_protocol', label: 'Royal Protocol' },
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

export default function AdminTraining() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const queryClient = useQueryClient();

  const { data: videos } = useQuery({
    queryKey: ['admin-training'],
    queryFn: () => firebaseApi.entities.TrainingVideo.list('order'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => firebaseApi.entities.TrainingVideo.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-training'] }); toast.success('Video created'); },
    onError: (error) => { toast.error(error?.message || 'Failed to save video'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.TrainingVideo.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-training'] }); toast.success('Video updated'); },
    onError: (error) => { toast.error(error?.message || 'Failed to update video'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseApi.entities.TrainingVideo.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-training'] });
      const previousItems = queryClient.getQueryData(['admin-training']);
      queryClient.setQueryData(['admin-training'], (current = []) => current.filter((item) => item.id !== id));
      return { previousItems };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-training'] }); toast.success('Video deleted'); },
    onError: (error, _id, context) => {
      if (context?.previousItems) queryClient.setQueryData(['admin-training'], context.previousItems);
      toast.error(error?.message || 'Failed to delete video');
    },
  });

  const togglePublish = (video) => {
    updateMutation.mutate({ id: video.id, data: { published: !video.published } });
  };

  const openCreate = () => { setEditing(null); setForm(INITIAL); setOpen(true); };
  const openEdit = (v) => { setEditing(v); setForm({ ...INITIAL, ...v, tags: Array.isArray(v.tags) ? v.tags.join(', ') : v.tags || '' }); setOpen(true); };
  const closeDialog = () => { setOpen(false); setEditing(null); setForm(INITIAL); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.video_url) { toast.error('Title and video are required'); return; }
    const payload = {
      ...form,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : form.tags,
    };
    const optimisticId = editing ? editing.id : `pending-${Date.now()}`;
    queryClient.setQueryData(['admin-training'], (current = []) => {
      if (editing) {
        return current.map((item) => (item.id === editing.id ? { ...item, ...payload } : item));
      }
      return [{ id: optimisticId, ...payload }, ...current];
    });
    closeDialog();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-sidebar-foreground">Training Portal</h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">{videos.length} video(s)</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Video
        </Button>
      </div>

      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-sm">
            {/* Thumbnail */}
            <div className="w-24 h-14 rounded-sm overflow-hidden bg-muted flex-shrink-0">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No img</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{video.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{video.video_url}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${video.published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {video.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => togglePublish(video)} className="p-1.5 text-muted-foreground hover:text-foreground">
                {video.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(video)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteMutation.mutate(video.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No training videos yet. Add one above.</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader>
            <DialogTitle className="text-sidebar-foreground">{editing ? 'Edit Training Video' : 'Add Training Video'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <Label className="text-sidebar-foreground/75">Title *</Label>
              <Input className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <Label className="text-sidebar-foreground/75">Description</Label>
              <Textarea className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/75">Album</Label>
                <Input className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" value={form.album || ''} onChange={(e) => setForm({ ...form, album: e.target.value })} />
              </div>
              <div>
                <Label className="text-sidebar-foreground/75">Tags</Label>
                <Input className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" value={form.tags || ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="culture, history, rites" />
              </div>
            </div>

            {/* Video upload — 3 options */}
            <MediaUploader
              label="Training Video *"
              value={form.video_url}
              onChange={(url) => setForm({ ...form, video_url: url })}
              accept="video/*"
              mediaType="video"
            />

            {/* Thumbnail — 3 options */}
            <MediaUploader
              label="Thumbnail Image"
              value={form.thumbnail_url}
              onChange={(url) => setForm({ ...form, thumbnail_url: url })}
              accept="image/*"
              mediaType="image"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground/75">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border text-sidebar-foreground">
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sidebar-foreground/75">Duration (e.g. 12:30)</Label>
                <Input className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="00:00" />
              </div>
            </div>

            <div>
              <Label className="text-sidebar-foreground/75">Display Order</Label>
              <Input className="mt-1 bg-sidebar-accent border-sidebar-border text-sidebar-foreground" type="number" value={form.order || 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} id="published" />
              <Label htmlFor="published" className="text-sidebar-foreground/75">Publish immediately</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={Boolean(form.featured)} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="featured" />
              <Label htmlFor="featured" className="text-sidebar-foreground/75">Feature this video</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Create Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
