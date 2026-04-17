import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Send, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SectionHeader from '../components/shared/SectionHeader';
import ShareButtons from '../components/shared/ShareButtons';
import Seo from '@/components/shared/Seo';
import { useAuth } from '@/lib/AuthContext';
import { normalizeImageUrl } from '@/lib/siteSettings';
import { usePreloadImages } from '@/hooks/usePreloadImages';

const KING_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/dc37adcaa_generated_e3452ee4.png';

export default function Memorial() {
  const { t } = useLanguage();
  const { appPublicSettings } = useAuth();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const memorialSettings = appPublicSettings?.memorial || {};

  const { data: kings } = useQuery({
    queryKey: ['lateKing'],
    queryFn: () => firebaseApi.entities.King.filter({ is_late_king: true, published: true }),
    initialData: [],
  });

  const { data: tributes } = useQuery({
    queryKey: ['tributes'],
    queryFn: () => firebaseApi.entities.TributeMessage.filter({ published: true }, '-created_date', 50),
    initialData: [],
  });

  const submitTribute = useMutation({
    mutationFn: (data) => firebaseApi.entities.TributeMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes'] });
      setName('');
      setMessage('');
      toast.success('Your tribute has been submitted.');
    },
  });

  const king = kings[0];
  const memorialHeroImageUrl = normalizeImageUrl(memorialSettings.heroImageUrl || king?.photo_url || KING_IMAGE);
  usePreloadImages([memorialHeroImageUrl], 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    submitTribute.mutate({
      author_name: name,
      message,
      king_id: king?.id || '',
      published: true,
    });
  };

  return (
    <div>
      <Seo
        title="Memorial"
        description="Public memorial tributes, acknowledgements, burial details, and downloadable programme information for the Awutu Bawjiase community."
      />
      {/* Hero Memorial */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-4">
                {t('inMemoriamLabel')}
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
                {king?.name || t('lateKing')}
              </h1>
              {king?.title && (
                <p className="text-xl text-primary mt-3 font-display italic">{king.title}</p>
              )}
              {(king?.birth_date || king?.death_date) && (
                <p className="text-muted-foreground mt-4 text-lg">
                  {king.birth_date && new Date(king.birth_date).getFullYear()}
                  {king.birth_date && king.death_date && ' — '}
                  {king.death_date && new Date(king.death_date).getFullYear()}
                </p>
              )}
              {king?.biography && (
                <p className="mt-6 text-muted-foreground leading-relaxed text-base max-w-lg line-clamp-6">
                  {king.biography}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="aspect-[3/4] max-w-md mx-auto rounded-sm overflow-hidden shadow-2xl">
                <img
                  src={memorialHeroImageUrl}
                  alt={king?.name || 'The Late King'}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {(memorialSettings.obituaryText || memorialSettings.burialDetails || memorialSettings.thanksgivingDetails || memorialSettings.familyAcknowledgements || memorialSettings.serviceOrder) && (
        <section className="py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="surface-panel rounded-sm p-6 lg:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-primary font-medium mb-3">{memorialSettings.obituaryTitle || 'Memorial Programme'}</p>
              {memorialSettings.obituaryText && (
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-semibold mb-3">Obituary</h2>
                  <p className="text-muted-foreground leading-8 whitespace-pre-wrap">{memorialSettings.obituaryText}</p>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {memorialSettings.burialDetails && (
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-3">Burial Details</h3>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">{memorialSettings.burialDetails}</p>
                  </div>
                )}
                {memorialSettings.thanksgivingDetails && (
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-3">Thanksgiving Details</h3>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">{memorialSettings.thanksgivingDetails}</p>
                  </div>
                )}
                {memorialSettings.familyAcknowledgements && (
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-3">Family Acknowledgements</h3>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">{memorialSettings.familyAcknowledgements}</p>
                  </div>
                )}
                {memorialSettings.serviceOrder && (
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-3">Service Order</h3>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">{memorialSettings.serviceOrder}</p>
                  </div>
                )}
              </div>
              {memorialSettings.programmeFileUrl && (
                <div className="mt-8">
                  <a
                    href={memorialSettings.programmeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-primary/30 px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {memorialSettings.programmeLabel || 'Download Memorial Programme'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Hall of Echoes - Tributes */}
      <section className="py-20 lg:py-32 bg-card border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <SectionHeader
            label={t('hallOfEchoes')}
            title={t('leaveTribute')}
            description={t('tributeDesc')}
          />

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-16 space-y-4">
            <Input
              placeholder={t('yourName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
              required
            />
            <Textarea
              placeholder={t('yourTribute')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background min-h-[120px]"
              required
            />
            <Button
              type="submit"
              disabled={submitTribute.isPending}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              {submitTribute.isPending ? t('submitting') : t('submitTribute')}
            </Button>
          </form>

          {/* Download PDF of tributes */}
          {tributes.length > 0 && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  const content = tributes.map(t => `"${t.message}"\n— ${t.author_name}`).join('\n\n---\n\n');
                  const blob = new Blob([`CONDOLENCE BOOK\nAwutu Bawjiase Community\n\n${content}`], { type: 'text/plain' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                  a.download = 'condolence-book.txt'; a.click();
                }}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors border border-primary/30 rounded-sm px-4 py-2"
              >
                <Download className="w-4 h-4" />
                {t('downloadCondolence')}
              </button>
            </div>
          )}

          {/* Tribute Wall */}
          <div className="space-y-6">
            <AnimatePresence>
              {tributes.map((tribute, i) => (
                <motion.div
                  key={tribute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="text-center py-6 border-b border-border/30 last:border-0"
                >
                  <p className="text-foreground italic leading-relaxed font-display text-lg">
                    "{tribute.message}"
                  </p>
                  <p className="text-sm text-primary mt-3 font-medium">
                    — {tribute.author_name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {tributes.length === 0 && (
              <div className="text-center py-12">
                <Crown className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">{t('beFirst')}</p>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 flex justify-center">
            <ShareButtons title="Memorial — Awutu Bawjiase Community" />
          </div>
        </div>
      </section>
    </div>
  );
}
