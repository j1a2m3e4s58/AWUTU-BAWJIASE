import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';

export default function AppLaunchCrest() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('awutu-launch-crest-shown');
  });

  useEffect(() => {
    if (!visible) return undefined;

    sessionStorage.setItem('awutu-launch-crest-shown', 'true');
    const timer = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] grid place-items-center bg-background/86 backdrop-blur-xl animate-out fade-out duration-500">
      <div className="relative flex flex-col items-center text-center">
        <div className="absolute h-44 w-44 bg-primary/20 blur-3xl" />
        <div className="relative grid h-24 w-24 place-items-center border border-primary/45 bg-card/80 shadow-[0_26px_80px_-36px_rgba(212,165,87,0.95)]">
          <div className="absolute inset-2 border border-primary/20" />
          <Crown className="h-11 w-11 text-primary motion-safe:animate-[royal-crown-rise_1.15s_ease-out_both]" />
        </div>
        <div className="relative mt-5">
          <p className="font-display text-2xl font-semibold leading-none text-foreground">
            Awutu Bawjiase
          </p>
          <p className="mt-2 text-[0.62rem] uppercase tracking-[0.28em] text-primary/90">
            Community
          </p>
        </div>
      </div>
    </div>
  );
}
