import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, ImagePlus, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { firebaseApi } from '@/api/firebaseClient';
import { getMergedPublicSettings } from '@/lib/siteSettings';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MediaUploader from '@/components/shared/MediaUploader';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const PAGE_FIELDS = [
  { key: 'about', label: 'About' },
  { key: 'history', label: 'History' },
  { key: 'funeral', label: 'Funeral' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'news', label: 'News' },
  { key: 'events', label: 'Events' },
  { key: 'lineage', label: 'Lineage' },
  { key: 'leadership', label: 'Leadership Directory' },
  { key: 'documents', label: 'Documents' },
  { key: 'contact', label: 'Contact' },
  { key: 'guidance', label: 'Visitor Guidance' },
  { key: 'search', label: 'Search' },
  { key: 'videos', label: 'Videos Portal' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'terms', label: 'Terms' },
];

const deepSet = (source, path, value) => {
  const keys = path.split('.');
  const output = Array.isArray(source) ? [...source] : { ...source };
  let current = output;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return output;
};

const HeroPreviewCard = ({ label, description, imageUrl, className = 'min-h-[13rem]' }) => (
  <div className={`relative overflow-hidden border border-sidebar-border bg-sidebar ${className}`}>
    <HeroBackdrop
      imageUrl={imageUrl}
      className="absolute inset-0"
      overlayClassName="bg-gradient-to-br from-sidebar/65 via-sidebar/82 to-sidebar/96"
    />
    <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-sidebar-primary/85">Live Preview</p>
      <h3 className="font-display text-xl text-sidebar-foreground">{label}</h3>
      <p className="max-w-xl text-sm leading-6 text-sidebar-foreground/70">
        {description}
      </p>
    </div>
  </div>
);

const HeroQuickCard = ({ title, subtitle, imageUrl, isActive, onEdit, onClear, pagePath }) => (
  <article className={`group relative overflow-hidden border bg-sidebar-accent transition-colors ${isActive ? 'border-sidebar-primary' : 'border-sidebar-border'}`}>
    <HeroPreviewCard
      label={title}
      description={subtitle}
      imageUrl={imageUrl}
      className="min-h-[11rem]"
    />
    <div className="border-t border-sidebar-border bg-sidebar-accent/95 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-lg text-sidebar-foreground">{title}</h4>
            <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
              imageUrl
                ? 'border-sidebar-primary/40 bg-sidebar-primary/10 text-sidebar-primary'
                : 'border-sidebar-border bg-sidebar text-sidebar-foreground/60'
            }`}>
              {imageUrl ? 'Custom' : 'Default'}
            </span>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-sidebar-foreground/45">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {pagePath ? (
            <Button asChild type="button" size="sm" variant="outline" className="gap-2 border-sidebar-border text-sidebar-foreground">
              <Link to={pagePath} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                View Page
              </Link>
            </Button>
          ) : null}
          <Button type="button" size="sm" className="gap-2" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button type="button" size="sm" variant="outline" className="gap-2 border-sidebar-border text-sidebar-foreground" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  </article>
);

export default function AdminHeroBanners() {
  const queryClient = useQueryClient();
  const { refreshPublicSettings } = useAuth();
  const [form, setForm] = useState(() => getMergedPublicSettings(null));
  const [selectedHero, setSelectedHero] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: () => firebaseApi.siteSettings.getPublic(),
  });

  const mergedSettings = useMemo(() => getMergedPublicSettings(settings), [settings]);

  useEffect(() => {
    setForm(mergedSettings);
  }, [mergedSettings]);

  useEffect(() => {
    setSelectedHero((current) => current || 'home');
  }, []);

  const saveMutation = useMutation({
    mutationFn: (payload) => firebaseApi.siteSettings.upsertPublic(payload),
    onSuccess: (data) => {
      const normalized = getMergedPublicSettings(data);
      queryClient.setQueryData(['admin-site-settings'], normalized);
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      setForm(normalized);
      refreshPublicSettings().catch((error) => {
        console.error('Background public settings refresh failed:', error);
      });
      toast.success('Hero banners saved');
    },
    onError: (error) => {
      console.error('Hero banner save failed:', error);
      toast.error(error?.message || 'Failed to save hero banners');
    },
  });

  const updateField = (path, value) => {
    setForm((current) => deepSet(current, path, value));
  };

  const handleReset = () => {
    setForm(mergedSettings);
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const filteredPages = PAGE_FIELDS.filter((page) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return page.label.toLowerCase().includes(term) || page.key.toLowerCase().includes(term);
  });

  const heroMeta =
    selectedHero === 'home'
      ? {
          key: 'home',
          label: 'Homepage Hero',
          hint: 'This image appears behind the main homepage message.',
          imageUrl: form.home.heroImageUrl,
          updatePath: 'home.heroImageUrl',
          previewTitle:
            form.home.titleLead && form.home.titleAccent
              ? `${form.home.titleLead} ${form.home.titleAccent}`
              : 'Homepage Hero',
          previewDescription: form.home.description || 'Homepage hero description',
        }
      : {
          key: selectedHero,
          label: PAGE_FIELDS.find((page) => page.key === selectedHero)?.label || 'Page Hero',
          hint: 'This image appears behind the page hero section.',
          imageUrl: form.pages[selectedHero]?.heroImageUrl || '',
          updatePath: `pages.${selectedHero}.heroImageUrl`,
          previewTitle:
            form.pages[selectedHero]?.title ||
            PAGE_FIELDS.find((page) => page.key === selectedHero)?.label ||
            'Page Hero',
          previewDescription:
            form.pages[selectedHero]?.description ||
            `${PAGE_FIELDS.find((page) => page.key === selectedHero)?.label || 'Page'} hero section`,
        };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Hero Banners</h2>
          <p className="mt-1 text-sm text-sidebar-foreground/65">
            Upload and manage homepage and public page hero images from one dedicated admin area.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-sidebar-border text-sidebar-foreground"
            disabled={saveMutation.isPending}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Hero Banners'}
          </Button>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-sidebar-primary">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Homepage Hero</h3>
            <p className="text-sm text-sidebar-foreground/60">
              This image appears behind the main homepage message. If left empty, the animated default banner stays in place.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <HeroQuickCard
            title="Homepage Hero"
            subtitle="Main landing banner"
            imageUrl={form.home.heroImageUrl}
            isActive={selectedHero === 'home'}
            onEdit={() => setSelectedHero('home')}
            onClear={() => updateField('home.heroImageUrl', '')}
            pagePath="/"
          />
          <div className="border border-sidebar-border bg-sidebar-accent p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-sidebar-border bg-sidebar text-sidebar-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-lg text-sidebar-foreground">Focused Editor</h4>
                <p className="mt-1 text-sm text-sidebar-foreground/60">
                  Pick any hero card below, then edit or replace its image here.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <HeroPreviewCard
                label={heroMeta.previewTitle}
                description={heroMeta.previewDescription}
                imageUrl={heroMeta.imageUrl}
                className="min-h-[15rem]"
              />
              <div>
                <Label className="text-sidebar-foreground/70">{heroMeta.label}</Label>
                <p className="mt-1 text-xs text-sidebar-foreground/50">
                  {heroMeta.hint} Use an image URL, upload from device, or paste a Google Drive share link.
                </p>
              </div>
              <MediaUploader
                label={`${heroMeta.label} Image`}
                value={heroMeta.imageUrl}
                onChange={(url) => updateField(heroMeta.updatePath, url)}
                accept="image/*"
                mediaType="image"
              />
              <div>
                <Label className="text-sidebar-foreground/70">Current Image URL</Label>
                <Input
                  value={heroMeta.imageUrl}
                  onChange={(event) => updateField(heroMeta.updatePath, event.target.value)}
                  className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h3 className="font-display text-xl text-sidebar-foreground">Public Page Heroes</h3>
          <p className="text-sm text-sidebar-foreground/60">
            Each page can have its own hero banner. Leaving a field empty keeps the animated default artwork.
          </p>
        </div>

        <div className="border border-sidebar-border bg-sidebar-accent p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Label className="text-sidebar-foreground/70">Search Page Hero</Label>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by page name or key"
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-sidebar-border text-sidebar-foreground"
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Clear
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-sidebar-foreground/45">
            Showing {filteredPages.length} of {PAGE_FIELDS.length} page heroes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredPages.map((page) => (
            <HeroQuickCard
              key={page.key}
              title={page.label}
              subtitle={page.key}
              imageUrl={form.pages[page.key].heroImageUrl}
              isActive={selectedHero === page.key}
              onEdit={() => setSelectedHero(page.key)}
              onClear={() => updateField(`pages.${page.key}.heroImageUrl`, '')}
              pagePath={page.key === 'leadership' ? '/leadership' : page.key === 'guidance' ? '/guidance' : page.key === 'videos' ? '/videos' : `/${page.key}`}
            />
          ))}
        </div>
        {filteredPages.length === 0 ? (
          <div className="border border-dashed border-sidebar-border bg-sidebar-accent p-8 text-center">
            <p className="font-display text-lg text-sidebar-foreground">No hero pages match that search.</p>
            <p className="mt-2 text-sm text-sidebar-foreground/60">
              Try another page name or clear the filter to see all hero cards again.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
