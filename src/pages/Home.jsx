import React from 'react';
import { Link } from 'react-router-dom';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, BookOpen, Calendar, Users, FileText, Megaphone } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import { useLanguage } from '@/lib/LanguageContext';
import Seo from '@/components/shared/Seo';
import { useAuth } from '@/lib/AuthContext';
import HeroBackdrop from '@/components/shared/HeroBackdrop';

const KING_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/dc37adcaa_generated_e3452ee4.png';
const ARTIFACTS_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/bffc1cf8d_generated_64e10ec5.png';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function Home() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const homeSettings = appPublicSettings?.home || {};
  const homeSections = homeSettings?.sections || {};
  const { data: lateKing } = useQuery({
    queryKey: ['lateKing'],
    queryFn: () => firebaseApi.entities.King.filter({ is_late_king: true, published: true }),
    initialData: [],
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements-home'],
    queryFn: () => firebaseApi.entities.Announcement.filter({ published: true, pinned: true }, '-created_date', 3),
    initialData: [],
  });

  const { data: events } = useQuery({
    queryKey: ['events-home'],
    queryFn: () => firebaseApi.entities.CommunityEvent.filter({ published: true }, 'date', 3),
    initialData: [],
  });
  const { data: leaders } = useQuery({
    queryKey: ['leaders-home'],
    queryFn: () => firebaseApi.entities.King.filter({ published: true }, 'order', 6),
    initialData: [],
  });
  const { data: galleryItems } = useQuery({
    queryKey: ['gallery-home'],
    queryFn: () => firebaseApi.entities.GalleryItem.filter({ published: true }, '-created_date', 6),
    initialData: [],
  });
  const { data: videos } = useQuery({
    queryKey: ['videos-home'],
    queryFn: () => firebaseApi.entities.TrainingVideo.filter({ published: true }, 'order', 6),
    initialData: [],
  });
  const { data: documents } = useQuery({
    queryKey: ['documents-home'],
    queryFn: () => firebaseApi.entities.ArchiveDocument.filter({ published: true }, '-created_date', 6),
    initialData: [],
  });

  const king = lateKing[0];
  const featuredLeaders = (leaders.filter((item) => item.featured).length > 0 ? leaders.filter((item) => item.featured) : leaders).slice(0, 3);
  const featuredGallery = (galleryItems.filter((item) => item.featured).length > 0 ? galleryItems.filter((item) => item.featured) : galleryItems).slice(0, 4);
  const featuredVideos = (videos.filter((item) => item.featured).length > 0 ? videos.filter((item) => item.featured) : videos).slice(0, 3);
  const featuredDocuments = (documents.filter((item) => item.featured).length > 0 ? documents.filter((item) => item.featured) : documents).slice(0, 3);
  const nextEvent = events.find((event) => event.date && new Date(event.date) >= new Date()) || events[0];
  const pinnedAnnouncement = announcements[0];

  return (
    <div>
      <Seo
        title="Home"
        description="Preserving the Awutu Bawjiase royal heritage through memorials, history, ceremonies, and public archives."
      />
      {/* Hero */}
      <section className="relative min-h-[92svh] lg:min-h-screen flex items-center pt-16 lg:pt-0 overflow-hidden">
        <HeroBackdrop
          imageUrl={homeSettings.heroImageUrl}
          overlayClassName="bg-gradient-to-r from-background via-background/90 to-background/40"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-4">
                {(lang === 'twi' ? homeSettings.label_twi : homeSettings.label) || t('homeLabel')}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-[1.1]">
                {(lang === 'twi' ? homeSettings.titleLead_twi : homeSettings.titleLead) || t('homeHeroTitle1')}<br />
                <span className="text-primary">{(lang === 'twi' ? homeSettings.titleAccent_twi : homeSettings.titleAccent) || t('homeHeroTitle2')}</span>
              </h1>
              <p className="mt-5 text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg">
                {(lang === 'twi' ? homeSettings.description_twi : homeSettings.description) || t('homeHeroDesc')}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/memorial"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-sm text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors"
                >
                  {t('viewMemorial')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/kings"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-sm text-sm font-medium tracking-wide hover:bg-muted transition-colors"
                >
                  {t('kingsArchive')}
                </Link>
              </div>
            </motion.div>

            {king && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <div className="aspect-[3/4] max-w-sm ml-auto rounded-sm overflow-hidden shadow-2xl">
                    <img
                      src={king.photo_url || KING_IMAGE}
                      alt={king.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-card border border-border p-6 rounded-sm shadow-lg max-w-xs">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-1">{t('inMemoriam')}</p>
                    <p className="font-display text-xl font-semibold">{king.name}</p>
                    {king.title && <p className="text-sm text-muted-foreground mt-1">{king.title}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-14 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionHeader
            label={t('navigate')}
            title={t('exploreArchive')}
            description={t('exploreDesc')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Crown, titleKey: 'kingsArchive', descKey: 'royalArchiveDesc', path: '/kings' },
              { icon: BookOpen, titleKey: 'communityHistory', descKey: 'historyDesc', path: '/history' },
              { icon: Calendar, titleKey: 'funeral', descKey: 'funeralDesc', path: '/funeral' },
              { icon: Users, titleKey: 'royalLineage', descKey: 'lineageDesc', path: '/lineage' },
            ].map((item, i) => (
              <motion.div key={item.path} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
                <Link
                  to={item.path}
                  className="group block surface-panel rounded-3xl p-8 hover:border-primary/30 hover:-translate-y-1 transition-all duration-500"
                >
                  <item.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-500" />
                  <h3 className="font-display text-xl font-semibold mb-2">{t(item.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
                  <ArrowRight className="w-4 h-4 text-primary mt-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {(lang === 'twi' ? homeSettings.communityMessage_twi : homeSettings.communityMessage || homeSettings.communityMessage_twi) && (
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="surface-panel rounded-sm p-6 lg:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">{t('communityMessage')}</p>
              <p className="text-lg text-muted-foreground leading-8">{(lang === 'twi' ? homeSettings.communityMessage_twi : homeSettings.communityMessage) || homeSettings.communityMessage_twi}</p>
            </div>
          </div>
        </section>
      )}

      {(pinnedAnnouncement || nextEvent || featuredDocuments.length > 0) && (
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid gap-4 lg:grid-cols-3">
              {pinnedAnnouncement && (
                <Link to="/news" className="surface-panel p-5 hover:border-primary/35 transition-colors">
                  <MegaphoneCard title={pinnedAnnouncement.title} label={t('featuredNotice')} body={pinnedAnnouncement.content} />
                </Link>
              )}
              {nextEvent && (
                <Link to="/events" className="surface-panel p-5 hover:border-primary/35 transition-colors">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <Calendar className="w-5 h-5" />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-medium">{t('nextCommunityEvent')}</p>
                  </div>
                  <h3 className="font-display text-2xl font-semibold">{nextEvent.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-6">
                    {nextEvent.date ? new Date(nextEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date to be announced'}
                  </p>
                </Link>
              )}
              {featuredDocuments[0] && (
                <Link to="/documents" className="surface-panel p-5 hover:border-primary/35 transition-colors">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <FileText className="w-5 h-5" />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-medium">{t('importantDocument')}</p>
                  </div>
                  <h3 className="font-display text-2xl font-semibold">{featuredDocuments[0].title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-6 line-clamp-3">
                    {featuredDocuments[0].preview_text || featuredDocuments[0].description || t('documentOpenArchive')}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {homeSections.showLeadership !== false && featuredLeaders.length > 0 && (
        <section className="py-14 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader
              label={t('leadership')}
              title={t('corridorOfKings')}
              description={t('royalArchiveDesc')}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredLeaders.map((leader) => (
                <Link key={leader.id} to={`/kings/${leader.id}`} className="surface-panel rounded-sm overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="aspect-[3/4] bg-muted">
                    {leader.photo_url ? (
                      <img src={leader.photo_url} alt={leader.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Crown className="w-16 h-16 text-muted-foreground/25" /></div>
                    )}
                  </div>
                  <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary mb-2">{leader.role_group?.replace(/_/g, ' ') || t('leadership')}</p>
                    <h3 className="font-display text-xl font-semibold">{leader.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{leader.title || leader.stool_role}</p>
                    {leader.summary && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{leader.summary}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && homeSections.showAnnouncements !== false && (
        <section className="py-14 lg:py-32 bg-card/65 border-y border-border/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader label={t('announcements')} title={t('latestNews')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {announcements.map((item, i) => (
                <motion.div key={item.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
                  <Link to="/news" className="block group">
                    <p className="text-xs uppercase tracking-[0.15em] text-primary font-medium mb-2">
                      {item.category?.replace('_', ' ') || 'General'}
                    </p>
                    <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Heritage Banner */}
      <section className="relative py-20 lg:py-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={ARTIFACTS_IMAGE} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-background/60" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight italic">
              {t('quote')}
            </p>
            <p className="mt-8 text-primary text-sm uppercase tracking-[0.2em] font-medium">
              - Marcus Garvey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      {events.length > 0 && homeSections.showEvents !== false && (
        <section className="py-14 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader label={t('eventsLabel')} title={t('upcomingCeremonies')} />
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to="/events"
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 surface-panel rounded-3xl hover:border-primary/30 transition-colors"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0 text-sm text-primary font-medium">
                    {event.date && new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {homeSections.showGallery !== false && featuredGallery.length > 0 && (
        <section className="py-14 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader label={t('featuredGallery')} title={t('importantVisualMoments')} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGallery.map((item) => (
                <Link key={item.id} to="/gallery" className="group">
                  <div className="aspect-square bg-muted overflow-hidden rounded-sm">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{item.title}</p>
                  {(item.caption || item.description) && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.caption || item.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {homeSections.showVideos !== false && featuredVideos.length > 0 && (
        <section className="py-14 lg:py-28 bg-card/55 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader label={t('featuredVideosLabel')} title={t('featuredVideosTitle')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredVideos.map((video) => (
                <Link key={video.id} to="/videos" className="surface-panel rounded-sm overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="aspect-video bg-muted">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary mb-2">{video.album || t('videosPortal')}</p>
                    <h3 className="font-display text-xl font-semibold">{video.title}</h3>
                    {video.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{video.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MegaphoneCard({ title, label, body }) {
  return (
    <>
      <div className="flex items-center gap-2 text-primary mb-3">
        <Megaphone className="w-5 h-5" />
        <p className="text-[11px] uppercase tracking-[0.2em] font-medium">{label}</p>
      </div>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-6 line-clamp-3">{body}</p>
    </>
  );
}
