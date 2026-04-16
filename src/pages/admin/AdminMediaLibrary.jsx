import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, ExternalLink, FileText, Image, PlaySquare, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMediaLibrary() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewAsset, setPreviewAsset] = useState(null);
  const { data: gallery = [] } = useQuery({ queryKey: ['media-gallery'], queryFn: () => firebaseApi.entities.GalleryItem.list('-created_date'), initialData: [] });
  const { data: videos = [] } = useQuery({ queryKey: ['media-videos'], queryFn: () => firebaseApi.entities.TrainingVideo.list('order'), initialData: [] });
  const { data: docs = [] } = useQuery({ queryKey: ['media-docs'], queryFn: () => firebaseApi.entities.ArchiveDocument.list('-created_date'), initialData: [] });
  const { data: announcements = [] } = useQuery({ queryKey: ['media-announcements'], queryFn: () => firebaseApi.entities.Announcement.list('-created_date'), initialData: [] });

  const assets = useMemo(() => ([
    ...gallery.filter((item) => item.image_url).map((item) => ({ id: `gallery-${item.id}`, type: 'Image', kind: 'image', title: item.title, url: item.image_url, meta: item.album || item.category })),
    ...videos.filter((item) => item.thumbnail_url || item.video_url).flatMap((item) => ([
      item.thumbnail_url ? { id: `video-thumb-${item.id}`, type: 'Video Thumbnail', kind: 'image', title: item.title, url: item.thumbnail_url, meta: item.album || item.category } : null,
      item.video_url ? { id: `video-${item.id}`, type: 'Video', kind: 'video', title: item.title, url: item.video_url, meta: item.album || item.category } : null,
    ].filter(Boolean))),
    ...docs.filter((item) => item.file_url).map((item) => ({ id: `doc-${item.id}`, type: 'Document File', kind: 'file', title: item.title, url: item.file_url, meta: item.category })),
    ...announcements.filter((item) => item.attachment_url).map((item) => ({ id: `announcement-${item.id}`, type: 'Announcement File', kind: 'file', title: item.title, url: item.attachment_url, meta: item.category })),
  ]), [announcements, docs, gallery, videos]);

  const filteredAssets = assets.filter((asset) => {
    const matchesType = typeFilter === 'all' || asset.kind === typeFilter;
    const matchesQuery = `${asset.title} ${asset.type} ${asset.meta || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });
  const counts = {
    image: assets.filter((asset) => asset.kind === 'image').length,
    video: assets.filter((asset) => asset.kind === 'video').length,
    file: assets.filter((asset) => asset.kind === 'file').length,
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Media URL copied');
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const iconMap = {
    image: Image,
    video: PlaySquare,
    file: FileText,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Media Library</h2>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Search, preview, open, and copy URLs for uploaded images, videos, and attached files already in the system.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Images', value: counts.image, icon: Image },
          { label: 'Videos', value: counts.video, icon: PlaySquare },
          { label: 'Files', value: counts.file, icon: FileText },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setTypeFilter(item.label.toLowerCase() === 'images' ? 'image' : item.label.toLowerCase() === 'videos' ? 'video' : 'file')}
            className="flex items-center justify-between border border-sidebar-border bg-sidebar-accent p-4 text-left hover:border-sidebar-primary/35"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/45">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-sidebar-foreground">{item.value}</p>
            </div>
            <item.icon className="h-5 w-5 text-sidebar-primary" />
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/45" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media library..." className="bg-sidebar-accent border-sidebar-border pl-10 text-sidebar-foreground" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue placeholder="All media" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Media</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="file">Files</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="border border-sidebar-border bg-sidebar-accent overflow-hidden">
            {asset.kind === 'image' ? (
              <button type="button" onClick={() => setPreviewAsset(asset)} className="block aspect-video w-full bg-sidebar">
                <img src={asset.url} alt={asset.title} className="h-full w-full object-cover" />
              </button>
            ) : (
              <button type="button" onClick={() => setPreviewAsset(asset)} className="flex aspect-video w-full items-center justify-center bg-sidebar">
                {React.createElement(iconMap[asset.kind] || FileText, { className: 'h-12 w-12 text-sidebar-primary/70' })}
              </button>
            )}
            <div className="p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-primary mb-2">{asset.type}</p>
            <p className="font-medium text-sidebar-foreground line-clamp-2">{asset.title}</p>
            {asset.meta && <p className="text-xs text-sidebar-foreground/55 mt-2">{asset.meta}</p>}
            <p className="mt-4 line-clamp-1 break-all text-xs text-sidebar-foreground/45">{asset.url}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => setPreviewAsset(asset)}>Preview</Button>
              <Button type="button" size="sm" variant="outline" className="gap-2 border-sidebar-border text-sidebar-foreground" onClick={() => copyUrl(asset.url)}>
                <Copy className="h-3.5 w-3.5" />
                Copy URL
              </Button>
              <Button asChild type="button" size="sm" variant="outline" className="gap-2 border-sidebar-border text-sidebar-foreground">
                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
            </div>
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && <p className="text-sm text-sidebar-foreground/60">No assets matched your search.</p>}
      </div>

      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DialogHeader>
            <DialogTitle className="font-display">{previewAsset?.title}</DialogTitle>
          </DialogHeader>
          {previewAsset && (
            <div className="space-y-4">
              {previewAsset.kind === 'image' && (
                <img src={previewAsset.url} alt={previewAsset.title} className="max-h-[55vh] w-full object-contain bg-sidebar-accent" />
              )}
              {previewAsset.kind === 'video' && (
                <video src={previewAsset.url} controls className="max-h-[55vh] w-full bg-black" />
              )}
              {previewAsset.kind === 'file' && (
                <div className="border border-sidebar-border bg-sidebar-accent p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-sidebar-primary" />
                  <p className="mt-3 text-sm text-sidebar-foreground/70">Open this file in a new tab to preview or download it.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => copyUrl(previewAsset.url)}>Copy URL</Button>
                <Button asChild type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground">
                  <a href={previewAsset.url} target="_blank" rel="noopener noreferrer">Open Original</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
