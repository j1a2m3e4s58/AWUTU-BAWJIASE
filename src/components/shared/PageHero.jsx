import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import HeroBackdrop from './HeroBackdrop';
import { useLanguage } from '@/lib/LanguageContext';

export default function PageHero({ label, title, description, imageUrl, pageKey }) {
  const { appPublicSettings } = useAuth();
  const { lang } = useLanguage();
  const pageSettings = pageKey ? appPublicSettings?.pages?.[pageKey] : null;
  const resolvedLabel = lang === 'twi'
    ? pageSettings?.label_twi || label
    : pageSettings?.label || label;
  const resolvedTitle = lang === 'twi'
    ? pageSettings?.title_twi || title
    : pageSettings?.title || title;
  const resolvedDescription = lang === 'twi'
    ? pageSettings?.description_twi || description
    : pageSettings?.description || description;
  const resolvedImageUrl = pageSettings?.heroImageUrl || imageUrl;

  return (
    <section className="relative overflow-hidden pt-[4.6rem] lg:pt-24">
      <HeroBackdrop
        imageUrl={resolvedImageUrl}
        overlayClassName="bg-gradient-to-b from-background/60 via-background/82 to-background"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-10 sm:py-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          {resolvedLabel && (
            <p className="mb-3 text-[0.64rem] font-medium uppercase tracking-[0.2em] text-primary sm:mb-4 sm:text-xs sm:tracking-[0.3em]">
              {resolvedLabel}
            </p>
          )}
          <h1 className="font-display text-[2rem] font-semibold leading-[1.08] text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            {resolvedTitle}
          </h1>
          {resolvedDescription && (
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
              {resolvedDescription}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
