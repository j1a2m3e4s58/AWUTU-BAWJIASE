import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Crown, GalleryVerticalEnd, Home, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const navItems = [
  { labelKey: 'home', path: '/', icon: Home },
  { labelKey: 'leadership', path: '/kings', icon: Crown },
  { labelKey: 'events', path: '/events', icon: CalendarDays },
  { labelKey: 'gallery', path: '/gallery', icon: GalleryVerticalEnd },
  { labelKey: 'contact', path: '/contact', icon: Phone },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const scrollToTop = () => {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.scrollingElement?.scrollTo?.(0, 0);
    }, 0);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-auto overflow-hidden border-t border-border/50 bg-background/72 shadow-[0_-12px_32px_-26px_rgba(0,0,0,0.88)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
        <nav className="grid grid-cols-5 items-end gap-1 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.45rem)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={scrollToTop}
                className={`relative flex min-h-[3.45rem] flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[0.5rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-foreground/82'
                }`}
              >
                <span
                  className={`absolute left-1/2 top-0 h-[2px] w-7 -translate-x-1/2 bg-primary transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <span
                  className={`flex h-9 w-9 items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-18px_rgba(212,165,87,0.95)] ring-1 ring-primary/35 scale-105'
                      : 'text-primary/95'
                  }`}
                >
                  <item.icon className="h-[0.95rem] w-[0.95rem]" />
                </span>
                <span className={`leading-none text-center whitespace-nowrap transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
