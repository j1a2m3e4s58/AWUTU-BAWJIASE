import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({ label, title, description, align = 'center' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 lg:mb-16 ${alignClass}`}
    >
      {label && (
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium mb-3">
          {label}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground text-base lg:text-lg max-w-2xl leading-relaxed mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
}