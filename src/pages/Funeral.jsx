import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Printer } from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import FuneralCountdown from '../components/shared/FuneralCountdown';
import ShareButtons from '../components/shared/ShareButtons';
import SmartImage from '@/components/shared/SmartImage';

const HERO_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/5c0255805_generated_bcf68b80.png';

export default function Funeral() {
  const { t } = useLanguage();
  const { data: funeralContent } = useQuery({
    queryKey: ['funeral-content'],
    queryFn: () => firebaseApi.entities.HistoryContent.filter({ section: 'funeral_info', published: true }, 'order'),
    initialData: [],
  });

  const { data: funeralEvents } = useQuery({
    queryKey: ['funeral-events'],
    queryFn: () => firebaseApi.entities.CommunityEvent.filter({ category: 'funeral', published: true }, 'date'),
    initialData: [],
  });

  return (
    <div>
      <PageHero
        label={t('ceremonyLabel')}
        title={t('funeralTitle')}
        description={t('funeralDesc')}
        imageUrl={HERO_IMAGE}
        pageKey="funeral"
      />

      <section className="py-14 lg:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10">
          {/* Countdown to first upcoming event */}
          {funeralEvents.filter(e => new Date(e.date) > new Date()).slice(0, 1).map(e => (
            <FuneralCountdown key={e.id} targetDate={e.date} eventTitle={e.title} />
          ))}

          {/* Funeral Events Schedule */}
          {funeralEvents.length > 0 && (
            <div className="mb-16">
              <h2 className="mb-8 text-center font-display text-2xl sm:text-3xl font-semibold">{t('ceremonySchedule')}</h2>
              <div className="space-y-4">
                {funeralEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="rounded-sm border border-border/50 bg-card p-5 sm:p-6"
                  >
                    <h3 className="mb-3 font-display text-lg sm:text-xl font-semibold">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {event.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
                      )}
                      {event.date && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />
                          {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-relaxed">{event.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Funeral Info Content */}
          {funeralContent.length > 0 ? (
            <div className="space-y-12">
              {funeralContent.map((item) => (
                <div key={item.id}>
                  {item.image_url && (
                    <div className="aspect-video rounded-sm overflow-hidden mb-6">
                      <SmartImage
                        src={item.image_url}
                        alt={item.title}
                        wrapperClassName="h-full w-full"
                        className="w-full h-full object-cover"
                        fallbackLabel="Funeral image unavailable"
                      />
                    </div>
                  )}
                  <h2 className="mb-4 font-display text-xl sm:text-2xl font-semibold">{item.title}</h2>
                  <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base sm:leading-relaxed">{item.content}</div>
                </div>
              ))}
            </div>
          ) : funeralEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('funeralComingSoon')}</p>
            </div>
          ) : null}

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ShareButtons title="Funeral Information — Awutu Bawjiase Community" />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t('printProgramme')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
