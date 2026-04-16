import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Search, Video, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageHero from '../components/shared/PageHero';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Seo from '@/components/shared/Seo';
import CommentThread from '@/components/shared/CommentThread';
import { getLocalizedField } from '@/lib/localizedContent';

const CATEGORY_LABELS = {
  royal_protocol: 'Royal Protocol',
  history: 'History',
  culture: 'Culture',
  ceremony: 'Ceremony',
  community: 'Community',
  other: 'Other',
};

const CATEGORY_COLORS = {
  royal_protocol: 'bg-primary/10 text-primary',
  history: 'bg-amber-100 text-amber-800',
  culture: 'bg-green-100 text-green-800',
  ceremony: 'bg-purple-100 text-purple-800',
  community: 'bg-blue-100 text-blue-800',
  other: 'bg-muted text-muted-foreground',
};

function isGDriveEmbed(url) {
  return url && url.includes('drive.google.com') && url.includes('/preview');
}

function isGDriveView(url) {
  return url && url.includes('drive.google.com') && !url.includes('/preview');
}

export default function Training() {
  const { t, lang } = useLanguage();
  const [activeVideo, setActiveVideo] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [albumFilter, setAlbumFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [query, setQuery] = useState('');

  const { data: videos } = useQuery({
    queryKey: ['training-videos'],
    queryFn: () => firebaseApi.entities.TrainingVideo.filter({ published: true }, 'order'),
    initialData: [],
  });
  const { data: comments = [] } = useQuery({
    queryKey: ['training-comments-counts'],
    queryFn: () => firebaseApi.entities.Comment.filter({ target_type: 'training_video', published: true, moderation_status: 'approved' }),
    initialData: [],
  });

  const filtered = videos.filter((video) => {
    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
    const matchesAlbum = albumFilter === 'all' || video.album === albumFilter;
    const matchesTag = tagFilter === 'all' || (video.tags || []).includes(tagFilter);
    const searchText = `${video.title ?? ''} ${video.description ?? ''}`.toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase());
    return matchesCategory && matchesAlbum && matchesTag && matchesQuery;
  });

  const categories = ['all', ...new Set(videos.map(v => v.category).filter(Boolean))];
  const albums = ['all', ...new Set(videos.map((video) => video.album).filter(Boolean))];
  const tags = ['all', ...new Set(videos.flatMap((video) => video.tags || []).filter(Boolean))];
  const sortedVideos = [...filtered].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.order ?? 0) - (b.order ?? 0));
  const featuredVideo = sortedVideos.find((video) => video.featured) ?? sortedVideos[0] ?? videos[0] ?? null;
  const featuredCollection = sortedVideos.filter((video) => video.featured).slice(0, 3);
  const commentCounts = comments.reduce((acc, comment) => {
    acc[comment.target_id] = (acc[comment.target_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Seo
        title="Videos Portal"
        description="Watch public heritage videos, ceremonial explainers, and community recordings from the Awutu Bawjiase archive."
      />
      <PageHero
        label={t('knowledgeLabel')}
        title={t('trainingTitle')}
        description={t('trainingDesc')}
        pageKey="videos"
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="surface-panel rounded-3xl p-6 lg:p-8 mb-10">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-3">{t('publicMedia')}</p>
                <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">
                  {t('videoIntroTitle')}
                </h2>
                <p className="mt-4 text-muted-foreground leading-7 max-w-2xl">
                  {t('videoIntroDesc')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: t('publishedVideos'), value: videos.length },
                  { label: t('categories'), value: Math.max(categories.length - 1, 0) },
                  { label: t('readyToWatch'), value: filtered.length },
                ].map((item) => (
                  <div key={item.label} className="border border-border/60 bg-background/75 px-4 py-3">
                    <div className="flex items-center justify-between gap-4 sm:block sm:text-center">
                      <p className="text-2xl font-semibold leading-none text-foreground">{item.value}</p>
                      <p className="text-right text-[0.64rem] uppercase leading-4 tracking-[0.12em] text-muted-foreground sm:mt-2 sm:text-center">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {featuredVideo && (
            <div className="surface-panel rounded-sm overflow-hidden mb-12">
              <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
                <div
                  className="relative aspect-video bg-muted cursor-pointer"
                  onClick={() => setActiveVideo(featuredVideo)}
                >
                  {featuredVideo.thumbnail_url ? (
                    <img src={featuredVideo.thumbnail_url} alt={featuredVideo.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-background">
                      <Video className="w-16 h-16 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-black/45" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-primary font-medium">{t('featuredVideo')}</p>
                  <h3 className="mt-3 font-display text-3xl font-semibold text-foreground">{getLocalizedField(featuredVideo, 'title', lang)}</h3>
                  {getLocalizedField(featuredVideo, 'description', lang) && (
                    <p className="mt-4 text-muted-foreground leading-7">{getLocalizedField(featuredVideo, 'description', lang)}</p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {featuredVideo.category && (
                      <Badge className={CATEGORY_COLORS[featuredVideo.category] || 'bg-muted text-muted-foreground'}>
                        {CATEGORY_LABELS[featuredVideo.category] || featuredVideo.category}
                      </Badge>
                    )}
                    {featuredVideo.duration && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {featuredVideo.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {featuredCollection.length > 1 && (
            <div className="grid gap-4 md:grid-cols-3 mb-10">
              {featuredCollection.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="surface-panel rounded-sm overflow-hidden text-left group"
                  onClick={() => setActiveVideo(video)}
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={getLocalizedField(video, 'title', lang)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                        <Video className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{getLocalizedField(video, 'title', lang)}</p>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-primary">{t('featured')}</span>
                    </div>
                    {video.album && (
                      <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80 mt-2">{video.album}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-8">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_repeat(2,minmax(0,0.45fr))]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchVideosPlaceholder')}
                  className="pl-10 bg-card/80"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-card/80">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? t('allCategories2') : CATEGORY_LABELS[cat] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={albumFilter} onValueChange={setAlbumFilter}>
                <SelectTrigger className="bg-card/80">
                  <SelectValue placeholder="All Albums" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map((album) => (
                    <SelectItem key={album} value={album}>
                      {album === 'all' ? t('allAlbums') : album}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tags.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-[0.16em] border transition-colors ${
                      tagFilter === tag
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
                    }`}
                  >
                    {tag === 'all' ? t('allTags') : tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noVideos')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="surface-panel rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-500 group"
                >
                  {/* Thumbnail / preview trigger */}
                  <div
                    className="relative aspect-video bg-muted cursor-pointer overflow-hidden"
                    onClick={() => setActiveVideo(video)}
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={getLocalizedField(video, 'title', lang)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Play className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {video.category && (
                          <Badge className={`text-xs mb-2 ${CATEGORY_COLORS[video.category] || 'bg-muted text-muted-foreground'}`}>
                            {CATEGORY_LABELS[video.category] || video.category}
                          </Badge>
                        )}
                        <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                          {getLocalizedField(video, 'title', lang)}
                        </h3>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {video.featured && <p className="text-primary mb-1">{t('featured')}</p>}
                        <p className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentCounts[video.id] || 0}
                        </p>
                      </div>
                    </div>
                    {video.album && (
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80 mt-1">{video.album}</p>
                    )}
                    {getLocalizedField(video, 'description', lang) && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{getLocalizedField(video, 'description', lang)}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-4xl bg-background rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full bg-black">
              {isGDriveEmbed(activeVideo.video_url) ? (
                <iframe
                  src={activeVideo.video_url}
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                  title={getLocalizedField(activeVideo, 'title', lang)}
                />
              ) : (
                <video
                  src={activeVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold">{getLocalizedField(activeVideo, 'title', lang)}</h3>
                  {getLocalizedField(activeVideo, 'description', lang) && (
                    <p className="text-sm text-muted-foreground mt-1">{getLocalizedField(activeVideo, 'description', lang)}</p>
                  )}
                <CommentThread targetType="training_video" targetId={activeVideo.id} title={t('videoComments')} />
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm whitespace-nowrap"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
