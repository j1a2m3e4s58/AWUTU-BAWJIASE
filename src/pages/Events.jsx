import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, User, Shirt, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import Seo from '@/components/shared/Seo';
import { getLocalizedField } from '@/lib/localizedContent';

export default function Events() {
  const { t, lang } = useLanguage();
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => firebaseApi.entities.CommunityEvent.filter({ published: true }, 'date'),
    initialData: [],
  });

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);
  const featured = events.find((item) => item.featured && new Date(item.date) >= now) || upcoming[0] || events[0];
  const groupByMonth = (items) => items.reduce((acc, item) => {
    const monthKey = new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    acc[monthKey] = acc[monthKey] || [];
    acc[monthKey].push(item);
    return acc;
  }, {});
  const upcomingByMonth = groupByMonth(upcoming);
  const pastByMonth = groupByMonth(past);

  return (
    <div>
      <Seo
        title="Events"
        description="See upcoming ceremonies, gatherings, and public community events from the Awutu Bawjiase archive."
      />
      <PageHero label={t('ceremoniesLabel')} title={t('eventsTitle')} pageKey="events" />

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {featured && (
            <div className="surface-panel rounded-sm overflow-hidden mb-10">
              <div className="grid lg:grid-cols-[1fr_1.1fr]">
                <div className="aspect-[4/3] bg-muted">
                  {featured.featured_image_url ? (
                    <img src={featured.featured_image_url} alt={featured.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-3">{t('featuredEvent')}</p>
                  <h2 className="font-display text-3xl font-semibold">{getLocalizedField(featured, 'title', lang)}</h2>
                  {getLocalizedField(featured, 'description', lang) && <p className="text-muted-foreground mt-4 leading-7">{getLocalizedField(featured, 'description', lang)}</p>}
                  <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm text-muted-foreground">
                    <p><span className="text-foreground font-medium">{t('venue')}:</span> {featured.venue || featured.location || t('communityVenue')}</p>
                    <p><span className="text-foreground font-medium">{t('organizer')}:</span> {featured.organizer || t('communityOffice')}</p>
                    <p><span className="text-foreground font-medium">{t('dressCode')}:</span> {featured.dress_code || t('asAnnounced')}</p>
                    <p><span className="text-foreground font-medium">{t('contact')}:</span> {featured.contact_person || featured.contact_phone || t('seeContactPage')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('noEvents')}</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-16">
                  <h2 className="font-display text-2xl font-semibold mb-6">{t('upcomingEvents')}</h2>
                  <div className="space-y-10">
                    {Object.entries(upcomingByMonth).map(([month, monthEvents]) => (
                      <div key={month}>
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{month}</p>
                        <div className="space-y-4">
                          {monthEvents.map((event, i) => (
                            <EventCard key={event.id} event={event} index={i} t={t} lang={lang} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6 text-muted-foreground">{t('pastEvents')}</h2>
                  <div className="space-y-10 opacity-70">
                    {Object.entries(pastByMonth).map(([month, monthEvents]) => (
                      <div key={month}>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">{month}</p>
                        <div className="space-y-4">
                          {monthEvents.map((event, i) => (
                            <EventCard key={event.id} event={event} index={i} t={t} lang={lang} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, index, t, lang }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="p-6 surface-panel rounded-sm"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider">
              {event.category?.replace('_', ' ') || t('communityVenue')}
            </Badge>
          </div>
          <h3 className="font-display text-xl font-semibold">{getLocalizedField(event, 'title', lang)}</h3>
          {getLocalizedField(event, 'description', lang) && (
            <p className="text-muted-foreground mt-2 leading-relaxed">{getLocalizedField(event, 'description', lang)}</p>
          )}
          <div className="grid gap-3 mt-4 text-sm text-muted-foreground sm:grid-cols-2">
            {(event.venue || event.location) && (
              <span className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {event.venue || event.location}
              </span>
            )}
            {event.organizer && (
              <span className="flex items-start gap-1.5">
                <User className="w-4 h-4 text-primary" />
                {event.organizer}
              </span>
            )}
            {event.dress_code && (
              <span className="flex items-start gap-1.5">
                <Shirt className="w-4 h-4 text-primary" />
                {event.dress_code}
              </span>
            )}
            {(event.contact_person || event.contact_phone) && (
              <span className="flex items-start gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                {[event.contact_person, event.contact_phone].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="capitalize text-primary">{event.category?.replace(/_/g, ' ') || t('communityVenue')}</span>
        </div>
      </div>
    </motion.div>
  );
}

