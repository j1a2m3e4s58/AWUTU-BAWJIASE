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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.45rem)] pt-2 md:hidden">
      <div className="pointer-events-auto mx-auto max-w-md overflow-hidden border border-border/45 bg-background/42 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
        <nav className="grid grid-cols-5 items-end gap-1.5 px-2 py-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex min-h-[3.7rem] flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-[0.52rem] uppercase tracking-[0.1em] transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-foreground/82'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-18px_rgba(212,165,87,0.95)] ring-1 ring-primary/35'
                      : 'text-primary/95'
                  }`}
                >
                  <item.icon className="h-[0.95rem] w-[0.95rem]" />
                </span>
                <span className="leading-none text-center whitespace-nowrap">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
