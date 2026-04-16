import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';

const ARTIFACTS_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/bffc1cf8d_generated_64e10ec5.png';

export default function About() {
  const { t } = useLanguage();
  const { data: content } = useQuery({
    queryKey: ['about-content'],
    queryFn: () => firebaseApi.entities.HistoryContent.filter({ section: 'about', published: true }, 'order'),
    initialData: [],
  });

  return (
    <div>
      <PageHero
        label={t('ourIdentity')}
        title={t('aboutTitle')}
        description={t('aboutDesc')}
        imageUrl={ARTIFACTS_IMAGE}
        pageKey="about"
      />

      <section className="py-16 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {content.length > 0 ? (
            <div className="space-y-16">
              {content.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                >
                  {item.image_url && (
                    <div className="aspect-video rounded-sm overflow-hidden mb-8">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h2 className="font-display text-3xl font-semibold mb-4">{item.title}</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
                    {item.content}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('contentComingSoon')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
