import React, { useEffect, useState } from 'react';

export default function AppLaunchCrest() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('awutu-launch-crest-shown');
  });

  useEffect(() => {
    if (!visible) return undefined;

    sessionStorage.setItem('awutu-launch-crest-shown', 'true');
    const timer = window.setTimeout(() => setVisible(false), 2900);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-background/95 backdrop-blur-xl motion-safe:animate-[royal-stage-exit_2.9s_ease-in-out_forwards]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,hsl(var(--primary)/0.24),transparent_24%),radial-gradient(circle_at_18%_78%,hsl(var(--primary)/0.16),transparent_18%),linear-gradient(145deg,hsl(var(--background)),hsl(var(--card)),hsl(var(--background)))]" />
      <div className="absolute left-[-18%] top-[15%] h-20 w-[150%] rotate-[-18deg] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-xl motion-safe:animate-[royal-gold-sweep_2.65s_ease-in-out_both]" />
      <div className="absolute h-[min(86vw,26rem)] w-[min(86vw,26rem)] border border-primary/10 motion-safe:animate-[royal-halo-turn_2.9s_ease-in-out_forwards]" />
      <div className="absolute h-[min(64vw,19rem)] w-[min(64vw,19rem)] border border-primary/15 motion-safe:animate-[royal-halo-counter_2.9s_ease-in-out_forwards]" />
      <div className="relative flex w-[min(86vw,34rem)] flex-col items-center text-center motion-safe:animate-[royal-crest-show_2.5s_cubic-bezier(.2,.9,.2,1)_both]">
        <div className="absolute h-[min(78vw,18rem)] w-[min(78vw,18rem)] bg-primary/24 blur-3xl motion-safe:animate-[royal-glow-pulse_2.5s_ease-in-out_both]" />
        <div className="absolute top-[2.8rem] h-[1px] w-[min(70vw,26rem)] bg-gradient-to-r from-transparent via-primary/45 to-transparent motion-safe:animate-[royal-line-reveal_2.1s_ease-out_0.35s_both]" />
        <div className="relative grid h-[min(38vw,9rem)] w-[min(38vw,9rem)] min-h-28 min-w-28 place-items-center border border-primary/55 bg-card/90 shadow-[0_34px_110px_-30px_rgba(212,165,87,0.98)]">
          <div className="absolute inset-2 border border-primary/25" />
          <div className="absolute -inset-3 border border-primary/12" />
          <div className="absolute -inset-6 border border-primary/10 motion-safe:animate-[royal-frame-pop_1.8s_ease-out_0.35s_both]" />
          <img
            src="/icons/icon-maskable.svg"
            alt=""
            className="h-[78%] w-[78%] object-contain motion-safe:animate-[royal-crown-bounce_1.75s_cubic-bezier(.16,1,.3,1)_both]"
          />
        </div>
        <div className="relative mt-7 motion-safe:animate-[royal-title-reveal_1.75s_ease-out_0.72s_both]">
          <p className="font-display text-[2.35rem] font-semibold leading-none text-foreground sm:text-4xl">
            Awutu Bawjiase
          </p>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.42em] text-primary/95">
            Community
          </p>
          <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-primary/75 to-transparent motion-safe:animate-[royal-line-reveal_1.65s_ease-out_1s_both]" />
        </div>
      </div>
    </div>
  );
}
