import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Network } from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import Seo from '@/components/shared/Seo';

export default function Lineage() {
  const { t } = useLanguage();
  const { data: kings, isLoading } = useQuery({
    queryKey: ['kings-lineage'],
    queryFn: () => firebaseApi.entities.King.filter({ published: true }, 'order'),
    initialData: [],
  });

  return (
    <div>
      <Seo
        title="Royal Lineage"
        description="Explore the line of rulers, family lines, and succession history preserved by the Awutu Bawjiase community archive."
      />
      <PageHero
        label={t('sovereignContinuum')}
        title={t('lineageTitle')}
        description={t('lineageDesc')}
        pageKey="lineage"
      />

      <section className="py-16 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {kings.length > 0 && (
            <div className="surface-panel rounded-3xl p-6 lg:p-8 mb-10">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary font-medium">Succession Overview</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">An easier way to follow the royal chain.</h2>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  <Network className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">{kings.length}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Published Rulers</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : kings.length === 0 ? (
            <div className="text-center py-20">
              <Crown className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('lineageComingSoon')}</p>
            </div>
          ) : (
            <div className="relative">
              {/* The Golden Spine */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-primary/30" />

              {kings.map((king, i) => (
                <motion.div
                  key={king.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="relative pl-16 md:pl-20 mb-12 last:mb-0"
                >
                  {/* Node */}
                  <div className={`absolute left-4 md:left-6 top-1 w-4 h-4 rounded-full border-2 border-primary ${
                    king.status === 'reigning' ? 'bg-primary' : 'bg-background'
                  }`} />

                  <Link to={`/kings/${king.id}`} className="group block">
                    <div className="flex items-start gap-6">
                      {king.photo_url && (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-border shrink-0">
                          <img src={king.photo_url} alt={king.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            king.status === 'reigning' ? 'bg-primary/10 text-primary' :
                            king.status === 'deceased' ? 'bg-muted text-muted-foreground' :
                            king.status === 'future' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {king.status}
                          </span>
                        </div>
                        <h3 className="font-display text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors">
                          {king.name}
                        </h3>
                        {king.title && (
                          <p className="text-sm text-muted-foreground">{king.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {king.reign_start && new Date(king.reign_start).getFullYear()}
                          {king.reign_start && ' - '}
                          {king.reign_end ? new Date(king.reign_end).getFullYear() : king.reign_start ? 'Present' : ''}
                        </p>
                        {king.family_line && (
                          <p className="text-xs text-primary/80 mt-1">{king.family_line}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
