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
    <section className="relative pt-20 lg:pt-24 overflow-hidden">
      <HeroBackdrop
        imageUrl={resolvedImageUrl}
        overlayClassName="bg-gradient-to-b from-background/60 via-background/82 to-background"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-12 sm:py-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          {resolvedLabel && (
            <p className="text-[0.68rem] uppercase tracking-[0.24em] sm:text-xs sm:tracking-[0.3em] text-primary font-medium mb-4">
              {resolvedLabel}
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
            {resolvedTitle}
          </h1>
          {resolvedDescription && (
            <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
              {resolvedDescription}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
