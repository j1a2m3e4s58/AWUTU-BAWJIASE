import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Pin, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageHero from '../components/shared/PageHero';
import ShareButtons from '../components/shared/ShareButtons';
import { AnnouncementSkeleton } from '../components/shared/LoadingSkeleton';
import { useLanguage } from '@/lib/LanguageContext';
import Seo from '@/components/shared/Seo';
import { getLocalizedField } from '@/lib/localizedContent';

export default function News() {
  const { t, lang } = useLanguage();
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => firebaseApi.entities.Announcement.filter({ published: true }, '-created_date'),
    initialData: [],
  });

  const pinned = announcements.filter((a) => a.pinned);
  const regular = announcements.filter((a) => !a.pinned);

  return (
    <div>
      <Seo
        title="News"
        description="Read public announcements, pinned notices, and community updates from the Awutu Bawjiase archive."
      />
      <PageHero label={t('stayInformed')} title={t('newsTitle')} pageKey="news" />

      <section className="py-14 lg:py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border border-border/50 rounded-sm bg-card">
                  <AnnouncementSkeleton key={i} />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-base text-muted-foreground">{t('noAnnouncements')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...pinned, ...regular].map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={`border rounded-3xl p-5 sm:p-6 lg:p-8 ${
                    item.pinned ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-card'
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    {item.pinned && <Pin className="w-4 h-4 text-primary" />}
                    <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                      {item.category?.replace('_', ' ') || t('general')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.created_date && new Date(item.created_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="mb-3 font-display text-xl sm:text-2xl font-semibold">{getLocalizedField(item, 'title', lang)}</h2>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base sm:leading-relaxed">
                    {getLocalizedField(item, 'content', lang)}
                  </p>
                  {item.attachment_url && (
                    <div className="mt-4">
                      <a
                        href={item.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 sm:w-auto"
                      >
                        <Paperclip className="w-4 h-4 text-primary" />
                        {t('openAttachment')}
                      </a>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <ShareButtons title={getLocalizedField(item, 'title', lang)} />
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
