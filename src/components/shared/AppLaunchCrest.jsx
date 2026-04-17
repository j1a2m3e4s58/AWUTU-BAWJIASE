import React, { useEffect, useState } from 'react';

export default function AppLaunchCrest() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('awutu-launch-crest-shown');
  });

  useEffect(() => {
    if (!visible) return undefined;

    sessionStorage.setItem('awutu-launch-crest-shown', 'true');
    const timer = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-background/94 backdrop-blur-xl motion-safe:animate-[royal-stage-exit_2.6s_ease-in-out_forwards]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.16),transparent_34%)]" />
      <div className="absolute h-[min(72vw,22rem)] w-[min(72vw,22rem)] border border-primary/10 motion-safe:animate-[royal-halo-turn_2.6s_ease-in-out_forwards]" />
      <div className="relative flex w-[min(82vw,32rem)] flex-col items-center text-center motion-safe:animate-[royal-crest-show_2.25s_cubic-bezier(.2,.9,.2,1)_both]">
        <div className="absolute h-[min(64vw,16rem)] w-[min(64vw,16rem)] bg-primary/22 blur-3xl motion-safe:animate-[royal-glow-pulse_2.25s_ease-in-out_both]" />
        <div className="relative grid h-[min(28vw,8rem)] w-[min(28vw,8rem)] min-h-24 min-w-24 place-items-center border border-primary/50 bg-card/90 shadow-[0_30px_90px_-32px_rgba(212,165,87,0.95)]">
          <div className="absolute inset-2 border border-primary/25" />
          <div className="absolute -inset-3 border border-primary/10" />
          <img
            src="/icons/icon-maskable.svg"
            alt=""
            className="h-[72%] w-[72%] object-contain motion-safe:animate-[royal-crown-bounce_1.55s_cubic-bezier(.16,1,.3,1)_both]"
          />
        </div>
        <div className="relative mt-6 motion-safe:animate-[royal-title-reveal_1.6s_ease-out_0.65s_both]">
          <p className="font-display text-3xl font-semibold leading-none text-foreground sm:text-4xl">
            Awutu Bawjiase
          </p>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.36em] text-primary/90">
            Community
          </p>
        </div>
      </div>
    </div>
  );
}
