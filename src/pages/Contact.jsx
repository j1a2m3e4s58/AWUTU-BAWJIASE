import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone, ExternalLink, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PageHero from '../components/shared/PageHero';
import { useLanguage } from '@/lib/LanguageContext';
import Seo from '@/components/shared/Seo';
import { useAuth } from '@/lib/AuthContext';

const BAWJIASE_BING_MAP_URL =
  'https://www.bing.com/maps/search?mepi=60%7E%7EEmbedded%7ELargeMapLink&ty=18&vdpid=5760092612006510593&v=2&sV=1&FORM=MIRE&q=Bawjiase%2C+Central+Region%2C+Ghana&ppois=5.683741092681885_-0.5561676025390625_Bawjiase%2C+Central+Region%2C+Ghana_%7E&cp=5.681554%7E-0.517110&lvl=12.3&style=r';
const BAWJIASE_OSM_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=-0.6062%2C5.6537%2C-0.5062%2C5.7137&layer=mapnik&marker=5.683741%2C-0.556168';

export default function Contact() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const rawContactSettings = appPublicSettings?.contact || {};
  const contactSettings = lang === 'en' ? rawContactSettings : {
    email: rawContactSettings.email,
    phone: rawContactSettings.phone,
    address: rawContactSettings.address,
    emergencyPhone: rawContactSettings.emergencyPhone,
  };
  const addressLines = (contactSettings.address || '').split('\n').filter(Boolean);
  const contactRoles = Array.isArray(contactSettings.contactRoles) ? contactSettings.contactRoles : [];

  const submit = useMutation({
    mutationFn: (data) => firebaseApi.entities.ContactMessage.create(data),
    onSuccess: () => {
      toast.success(t('messageSent'));
      setForm({ name: '', email: '', subject: '', message: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    submit.mutate(form);
  };

  return (
    <div>
      <Seo
        title="Contact"
        description="Contact the Awutu Bawjiase Community Archive with questions, suggestions, corrections, and public inquiries."
      />
      <PageHero
        label={t('reachOut')}
        title={t('contactTitle')}
        description={t('contactDesc')}
        pageKey="contact"
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="space-y-5 surface-panel rounded-3xl p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder={t('yourNamePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-card"
                    required
                  />
                  <Input
                    type="email"
                    placeholder={t('yourEmail')}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-card"
                    required
                  />
                </div>
                <Input
                  placeholder={t('subject')}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="bg-card"
                />
                <Textarea
                  placeholder={t('yourMessage')}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-card min-h-[160px]"
                  required
                />
                <Button type="submit" disabled={submit.isPending} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submit.isPending ? t('sending') : t('sendMessage')}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8 surface-panel rounded-3xl p-6 lg:p-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('email')}</p>
                  </div>
                  <p className="text-sm">{contactSettings.email || 'contact@eternallineage.com'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('phone')}</p>
                  </div>
                  <p className="text-sm">{contactSettings.phone || '+1 (000) 000-0000'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('address')}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {addressLines.length > 0 ? addressLines.map((line, index) => (
                      <React.Fragment key={`${line}-${index}`}>
                        {line}
                        {index < addressLines.length - 1 && <br />}
                      </React.Fragment>
                    )) : (
                      <>
                        Royal Heritage Palace<br />
                        Community Center District
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">{t('officeHours')}</p>
                  <p className="text-sm text-muted-foreground">{contactSettings.officeHours || t('checkBackOfficeHours')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">{t('visitingNotes')}</p>
                  <p className="text-sm text-muted-foreground">{contactSettings.visitingNotes || t('contactBeforeVisiting')}</p>
                </div>
                {contactRoles.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">{t('whoToContact')}</p>
                    <div className="space-y-3">
                      {contactRoles.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="border border-border/50 p-3">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(contactSettings.emergencyLabel || contactSettings.emergencyPhone) && (
                  <div className="border border-primary/25 bg-primary/8 p-4">
                    <p className="text-xs uppercase tracking-wider text-primary font-medium mb-2">{contactSettings.emergencyLabel || t('emergencyContact')}</p>
                    <p className="text-sm">{contactSettings.emergencyPhone || t('notProvidedYet')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="surface-panel rounded-[2rem] overflow-hidden"
          >
            <div className="grid lg:grid-cols-[0.95fr_1.25fr]">
              <div className="relative p-8 lg:p-10 bg-gradient-to-br from-primary/10 via-background to-accent/10">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-4">
                    {t('visitTheArea')}
                  </p>
                  <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
                    Awutu Bawjiase, Central Region, Ghana
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-7">
                    {t('mapIntro')}
                  </p>

                  <div className="mt-8 grid gap-3">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <MapPin className="w-4 h-4" />
                        <p className="text-xs uppercase tracking-[0.2em] font-medium">{t('location')}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Bawjiase, Central Region, Ghana</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Compass className="w-4 h-4" />
                        <p className="text-xs uppercase tracking-[0.2em] font-medium">{t('mapCoordinates')}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">5.683741, -0.556168</p>
                    </div>
                  </div>

                  <a
                    href={BAWJIASE_BING_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {t('openFullBingMap')}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="relative min-h-[360px] lg:min-h-full bg-muted">
                <iframe
                  title="Awutu Bawjiase map"
                  src={BAWJIASE_OSM_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
                <div className="absolute left-4 top-4 rounded-full border border-border/70 bg-background/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur">
                  {t('liveMapView')}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/65 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
