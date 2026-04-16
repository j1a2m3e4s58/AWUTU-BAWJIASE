import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Calendar, Award, Images, Megaphone, MapPin } from 'lucide-react';

export default function KingProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const kingId = window.location.pathname.split('/kings/')[1];

  const { data: kings } = useQuery({
    queryKey: ['kings-all'],
    queryFn: () => firebaseApi.entities.King.filter({ published: true }, 'order'),
    initialData: [],
  });
  const { data: galleryItems = [] } = useQuery({
    queryKey: ['king-gallery'],
    queryFn: () => firebaseApi.entities.GalleryItem.filter({ published: true }, '-created_date'),
    initialData: [],
  });
  const { data: events = [] } = useQuery({
    queryKey: ['king-events'],
    queryFn: () => firebaseApi.entities.CommunityEvent.filter({ published: true }, 'date'),
    initialData: [],
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ['king-announcements'],
    queryFn: () => firebaseApi.entities.Announcement.filter({ published: true }, '-created_date'),
    initialData: [],
  });

  const king = kings.find((k) => k.id === kingId);

  if (!king) {
    return (
      <div className="pt-32 pb-20 text-center">
        <Crown className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const relatedGallery = galleryItems.filter((item) => (king.gallery_ids || []).includes(item.id)).slice(0, 4);
  const relatedEvents = events.filter((item) => (king.related_event_ids || []).includes(item.id)).slice(0, 3);
  const relatedAnnouncements = announcements.filter((item) => (king.related_announcement_ids || []).includes(item.id)).slice(0, 3);

  return (
    <div className="pt-20 lg:pt-24 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Link
          to="/kings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <div className="aspect-[3/4] rounded-sm overflow-hidden bg-muted shadow-2xl sticky top-28">
              {king.photo_url ? (
                <img src={king.photo_url} alt={king.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Crown className="w-24 h-24 text-muted-foreground/20" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${
                king.status === 'reigning' ? 'bg-green-500' :
                king.status === 'deceased' ? 'bg-muted-foreground/40' :
                king.status === 'future' ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {(king.role_group || 'king').replace(/_/g, ' ')} · {king.status}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              {king.name}
            </h1>
            {king.title && (
              <p className="text-xl text-primary mt-2 font-display">{king.title}</p>
            )}
            {king.stool_role && (
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mt-4">{king.stool_role}</p>
            )}

            <div className="grid grid-cols-2 gap-6 mt-10 p-6 bg-card border border-border/50 rounded-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Reign Period</span>
                </div>
                <p className="text-sm font-medium">
                  {king.reign_start ? new Date(king.reign_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                  {' — '}
                  {king.reign_end ? new Date(king.reign_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Present'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Family Line</span>
                </div>
                <p className="text-sm font-medium">{king.family_line || 'Not specified'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Lineage Link</span>
                </div>
                <p className="text-sm font-medium">{king.lineage_link || 'See lineage page'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Public Summary</span>
                </div>
                <p className="text-sm font-medium">{king.summary || 'No short profile summary provided yet.'}</p>
              </div>
            </div>

            {king.biography && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold mb-4">Biography</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
                  {king.biography}
                </div>
              </div>
            )}

            {king.achievements && king.achievements.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Achievements
                </h2>
                <div className="space-y-3">
                  {king.achievements.map((achievement, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="text-muted-foreground">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedGallery.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Images className="w-5 h-5 text-primary" /> Related Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedGallery.map((item) => (
                    <Link key={item.id} to="/gallery" className="group">
                      <div className="aspect-square rounded-sm overflow-hidden bg-muted">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-sm mt-2">{item.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedEvents.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Related Events
                </h2>
                <div className="space-y-3">
                  {relatedEvents.map((item) => (
                    <Link key={item.id} to="/events" className="block surface-panel rounded-sm p-4 hover:border-primary/30 transition-colors">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.venue || item.location || 'Community venue'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedAnnouncements.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" /> Related Announcements
                </h2>
                <div className="space-y-3">
                  {relatedAnnouncements.map((item) => (
                    <Link key={item.id} to="/news" className="block surface-panel rounded-sm p-4 hover:border-primary/30 transition-colors">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
