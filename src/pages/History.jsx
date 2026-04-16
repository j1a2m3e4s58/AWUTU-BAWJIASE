import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';

const ARTIFACTS_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/bffc1cf8d_generated_64e10ec5.png';

export default function History() {
  const { t } = useLanguage();
  const { data: content } = useQuery({
    queryKey: ['history-content'],
    queryFn: () => firebaseApi.entities.HistoryContent.filter({ section: 'community_history', published: true }, 'order'),
    initialData: [],
  });
  const { data: stories } = useQuery({
    queryKey: ['history-stories'],
    queryFn: () => firebaseApi.entities.HistoryContent.filter({ section: 'heritage_story', published: true }, 'order'),
    initialData: [],
  });

  return (
    <div>
      <PageHero
        label={t('ourStory')}
        title={t('historyTitle')}
        description={t('historyDesc')}
        imageUrl={ARTIFACTS_IMAGE}
        pageKey="history"
      />

      <section className="py-16 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {stories.length > 0 && (
            <div className="mb-16">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary font-medium mb-3">Featured Heritage Stories</p>
                  <h2 className="font-display text-3xl font-semibold">Stories, symbols, and places that shape the community.</h2>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {stories.slice(0, 4).map((item) => (
                  <div key={item.id} className="surface-panel rounded-sm overflow-hidden">
                    {item.image_url && (
                      <div className="aspect-[4/3]">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary mb-2">{item.story_type || 'Heritage Story'}</p>
                      <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-3 leading-7 line-clamp-4">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.length > 0 ? (
            <div className="relative">
              {/* Golden Spine Timeline */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-1/2 hidden md:block" />
              
              {content.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`relative md:w-1/2 mb-16 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:ml-auto'}`}
                >
                  {/* Timeline dot */}
                  <div className={`hidden md:block absolute top-2 w-3 h-3 rounded-full bg-primary ${i % 2 === 0 ? 'right-0 translate-x-1/2 mr-[-1.5px]' : 'left-0 -translate-x-1/2 ml-[-1.5px]'}`} />
                  
                  {item.image_url && (
                    <div className="aspect-video rounded-sm overflow-hidden mb-6">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-2xl font-semibold mb-3">{item.title}</h3>
                  {item.timeline_date && (
                    <p className="text-xs uppercase tracking-[0.18em] text-primary mb-3">{new Date(item.timeline_date).getFullYear()}</p>
                  )}
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('historicalContent')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
