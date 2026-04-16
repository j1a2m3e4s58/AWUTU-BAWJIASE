import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Crown, BookOpen, Megaphone, FileText, Calendar, Image, PlaySquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import { getLocalizedField } from '@/lib/localizedContent';

export default function Search() {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();

  const { data: kings } = useQuery({ queryKey: ['s-kings'], queryFn: () => firebaseApi.entities.King.filter({ published: true }), initialData: [] });
  const { data: history } = useQuery({ queryKey: ['s-history'], queryFn: () => firebaseApi.entities.HistoryContent.filter({ published: true }), initialData: [] });
  const { data: announcements } = useQuery({ queryKey: ['s-ann'], queryFn: () => firebaseApi.entities.Announcement.filter({ published: true }), initialData: [] });
  const { data: docs } = useQuery({ queryKey: ['s-docs'], queryFn: () => firebaseApi.entities.ArchiveDocument.filter({ published: true }), initialData: [] });
  const { data: events } = useQuery({ queryKey: ['s-events'], queryFn: () => firebaseApi.entities.CommunityEvent.filter({ published: true }), initialData: [] });
  const { data: gallery } = useQuery({ queryKey: ['s-gallery'], queryFn: () => firebaseApi.entities.GalleryItem.filter({ published: true }), initialData: [] });
  const { data: videos } = useQuery({ queryKey: ['s-videos'], queryFn: () => firebaseApi.entities.TrainingVideo.filter({ published: true }), initialData: [] });

  const match = (text) => text && text.toLowerCase().includes(q);

  const results = q.length < 2 ? [] : [
    ...kings.filter(k => match(k.name) || match(k.title) || match(k.title_twi) || match(k.biography) || match(k.biography_twi)).map(k => ({
      type: t('leadership'), icon: Crown, title: getLocalizedField(k, 'name', lang) || k.name, desc: getLocalizedField(k, 'title', lang) || k.title || k.stool_role || k.status, path: `/kings/${k.id}`,
    })),
    ...history.filter(h => match(h.title) || match(h.title_twi) || match(h.content) || match(h.content_twi)).map(h => ({
      type: t('history'), icon: BookOpen, title: getLocalizedField(h, 'title', lang), desc: h.section?.replace(/_/g, ' '), path: '/history',
    })),
    ...announcements.filter(a => match(a.title) || match(a.title_twi) || match(a.content) || match(a.content_twi)).map(a => ({
      type: t('announcements'), icon: Megaphone, title: getLocalizedField(a, 'title', lang), desc: a.category, path: '/news',
    })),
    ...docs.filter(d => match(d.title) || match(d.title_twi) || match(d.description) || match(d.description_twi) || match(d.preview_text) || match(d.preview_text_twi)).map(d => ({
      type: t('documents'), icon: FileText, title: getLocalizedField(d, 'title', lang), desc: d.category?.replace(/_/g, ' '), path: '/documents',
    })),
    ...events.filter(e => match(e.title) || match(e.title_twi) || match(e.description) || match(e.description_twi) || match(e.venue) || match(e.location)).map(e => ({
      type: t('events'), icon: Calendar, title: getLocalizedField(e, 'title', lang), desc: e.category?.replace(/_/g, ' '), path: '/events',
    })),
    ...gallery.filter(g => match(g.title) || match(g.title_twi) || match(g.caption) || match(g.caption_twi) || match(g.description) || match(g.description_twi)).map(g => ({
      type: t('gallery'), icon: Image, title: getLocalizedField(g, 'title', lang), desc: g.album || g.category?.replace(/_/g, ' '), path: '/gallery',
    })),
    ...videos.filter(v => match(v.title) || match(v.title_twi) || match(v.description) || match(v.description_twi) || match(v.album)).map(v => ({
      type: t('videosPortal'), icon: PlaySquare, title: getLocalizedField(v, 'title', lang), desc: v.album || v.category?.replace(/_/g, ' '), path: '/videos',
    })),
  ];

  return (
    <div>
      <PageHero label={t('search')} title={t('searchTitle') || 'Find Anything'} description={t('searchDesc') || 'Search across leadership, history, announcements, events, gallery, videos, and documents.'} pageKey="search" />

      <section className="py-12 lg:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="relative mb-10">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-12 h-12 text-base bg-card"
            />
          </div>

          {q.length >= 2 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                {results.length} {results.length !== 1 ? 'results' : 'result'}
              </p>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      to={r.path}
                      className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-sm hover:border-primary/30 transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded-sm">
                        <r.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{r.type} · {r.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {results.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">No results for "{query}"</p>
                )}
              </div>
            </div>
          )}

          {q.length < 2 && query.length === 0 && (
            <p className="text-center text-muted-foreground">Start typing to search the archive...</p>
          )}
        </div>
      </section>
    </div>
  );
}

