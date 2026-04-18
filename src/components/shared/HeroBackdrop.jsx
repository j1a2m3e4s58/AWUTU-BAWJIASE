import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SmartImage from '@/components/shared/SmartImage';

const DEFAULT_HERO_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/5c0255805_generated_bcf68b80.png';

export default function HeroBackdrop({ imageUrl, className = '', overlayClassName = '' }) {
  const resolvedImage = imageUrl || DEFAULT_HERO_IMAGE;

  useEffect(() => {
    if (!resolvedImage) return;

    const preloadImage = new Image();
    preloadImage.decoding = 'async';
    preloadImage.src = resolvedImage;
  }, [resolvedImage]);

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale: 1.03 }}
        animate={{ scale: 1.1, x: [-8, 8, -8] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="h-full w-full"
      >
        <SmartImage
          src={resolvedImage}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover"
          fallbackLabel="Default hero image"
        />
      </motion.div>
      <div className={`absolute inset-0 ${overlayClassName}`} />
      <motion.div
        className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-primary/18 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-3rem] top-1/3 h-64 w-64 rounded-full bg-accent/16 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, -12, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/55 to-transparent"
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
