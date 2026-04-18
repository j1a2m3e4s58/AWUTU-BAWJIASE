import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHero from '../components/shared/PageHero';
import CommentThread from '@/components/shared/CommentThread';
import { useLanguage } from '@/lib/LanguageContext';
import { getLocalizedField } from '@/lib/localizedContent';
import { usePreloadImages } from '@/hooks/usePreloadImages';
import SmartImage from '@/components/shared/SmartImage';

const ARTIFACTS_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/bffc1cf8d_generated_64e10ec5.png';

export default function Gallery() {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState('all');
  const [album, setAlbum] = useState('all');
  const [activeTag, setActiveTag] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => firebaseApi.entities.GalleryItem.filter({ published: true }, '-created_date'),
    initialData: [],
  });
  const { data: comments = [] } = useQuery({
    queryKey: ['gallery-comments-counts'],
    queryFn: () => firebaseApi.entities.Comment.filter({ target_type: 'gallery_item', published: true, moderation_status: 'approved' }),
    initialData: [],
  });

  const albums = ['all', ...new Set(items.map((item) => item.album).filter(Boolean))];
  const tags = ['all', ...new Set(items.flatMap((item) => item.tags || []).filter(Boolean))];
  const filtered = items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesAlbum = album === 'all' || item.album === album;
    const matchesTag = activeTag === 'all' || (item.tags || []).includes(activeTag);
    return matchesCategory && matchesAlbum && matchesTag;
  });
  const sorted = [...filtered].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const featuredItems = sorted.filter((item) => item.featured).slice(0, 3);
  usePreloadImages(sorted.map((item) => item.image_url), 12);
  const commentCounts = comments.reduce((acc, comment) => {
    acc[comment.target_id] = (acc[comment.target_id] || 0) + 1;
    return acc;
  }, {});
  const albumCounts = sorted.reduce((acc, item) => {
    if (!item.album) return acc;
    acc[item.album] = (acc[item.album] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHero
        label={t('galleryLabel')}
        title={t('galleryTitle')}
        description={t('galleryDesc')}
        imageUrl={ARTIFACTS_IMAGE}
        pageKey="gallery"
      />

      <section className="py-14 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          {featuredItems.length > 0 && (
            <div className="surface-panel rounded-sm p-6 lg:p-8 mb-10">
              <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary font-medium">{t('featuredMoments')}</p>
                  <h2 className="font-display text-2xl lg:text-3xl font-semibold text-foreground mt-2">
                    {t('highlightedImages')}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {t('galleryFeaturedDesc')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {featuredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="group text-left"
                    onClick={() => setLightbox(item)}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                      <SmartImage
                        src={item.image_url}
                        alt={getLocalizedField(item, 'title', lang)}
                        wrapperClassName="h-full w-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        fallbackLabel="Gallery image unavailable"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate font-medium text-sm text-foreground">{getLocalizedField(item, 'title', lang)}</p>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-primary">{t('featured')}</span>
                    </div>
                    {(item.caption || item.description) && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getLocalizedField(item, 'caption', lang) || getLocalizedField(item, 'description', lang)}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary font-medium">{t('galleryFilterLabel')}</p>
                <h2 className="font-display text-2xl font-semibold text-foreground mt-2">{t('browseAlbumTags')}</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-48 bg-card">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories2')}</SelectItem>
                    <SelectItem value="royal_portraits">Royal Portraits</SelectItem>
                    <SelectItem value="ceremonies">Ceremonies</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                    <SelectItem value="funeral">Funeral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={album} onValueChange={setAlbum}>
                  <SelectTrigger className="w-full sm:w-52 bg-card">
                    <SelectValue placeholder="All Albums" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map((itemAlbum) => (
                      <SelectItem key={itemAlbum} value={itemAlbum}>
                        {itemAlbum === 'all' ? t('allAlbums') : itemAlbum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tags.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-[0.16em] border transition-colors ${
                      activeTag === tag
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
                    }`}
                  >
                    {tag === 'all' ? t('allTags') : tag}
                  </button>
                ))}
              </div>
            )}

            {Object.keys(albumCounts).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(albumCounts).slice(0, 6).map(([albumName, count]) => (
                  <span
                    key={albumName}
                    className="inline-flex items-center gap-2 border border-border/60 bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    <span className="text-foreground">{albumName}</span>
                    <span className="text-primary">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noImages')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => setLightbox(item)}
                >
                  <div className="aspect-square overflow-hidden rounded-sm bg-muted">
                    <SmartImage
                      src={item.image_url}
                      alt={getLocalizedField(item, 'title', lang)}
                      wrapperClassName="h-full w-full"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0"
                      fallbackLabel="Gallery image unavailable"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">{getLocalizedField(item, 'title', lang)}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {item.featured && <span className="text-primary">{t('featured')}</span>}
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentCounts[item.id] || 0}
                        </span>
                      </div>
                    </div>
                    {(item.caption || item.description) && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getLocalizedField(item, 'caption', lang) || getLocalizedField(item, 'description', lang)}</p>
                    )}
                    {item.album && (
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary mt-2">{item.album}</p>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.category?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4 backdrop-blur-md sm:p-6"
            onClick={() => setLightbox(null)}
          >
            <div
              className="flex w-full max-w-4xl max-h-[86vh] flex-col overflow-hidden border border-border/60 bg-card text-card-foreground shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-foreground font-display text-xl sm:text-2xl">
                    {getLocalizedField(lightbox, 'title', lang)}
                  </p>
                  {(getLocalizedField(lightbox, 'caption', lang) || getLocalizedField(lightbox, 'description', lang)) && (
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {getLocalizedField(lightbox, 'caption', lang) || getLocalizedField(lightbox, 'description', lang)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/60 bg-background/70 text-foreground transition-colors hover:bg-muted/70"
                  aria-label="Close image comments"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
                <div className="border-b border-border/60 bg-black/45 p-4 md:border-b-0 md:border-r">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <SmartImage
                      src={lightbox.image_url}
                      alt={getLocalizedField(lightbox, 'title', lang)}
                      wrapperClassName="mx-auto aspect-square max-h-44 w-full max-w-[14rem] sm:max-h-52 md:max-h-64"
                      className="h-full w-full object-cover"
                      fallbackLabel="Image unavailable"
                      loading="eager"
                    />
                  </motion.div>
                </div>

                <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                  <CommentThread targetType="gallery_item" targetId={lightbox.id} title={t('imageComments')} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
