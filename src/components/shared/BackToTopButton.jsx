import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 520);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center border border-border/60 bg-background/78 text-foreground shadow-[0_12px_28px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 md:bottom-6 ${
        visible
          ? 'pointer-events-auto bottom-[5.7rem] opacity-100'
          : 'pointer-events-none bottom-[4.8rem] opacity-0'
      }`}
    >
      <ArrowUp className="h-4 w-4 text-primary" />
    </button>
  );
}
