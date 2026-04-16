import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '@/lib/AuthContext';

export default function PublicLayout() {
  const { appPublicSettings } = useAuth();
  const notices = appPublicSettings?.notices || {};
  const noticeToneClasses = {
    info: 'border-primary/30 bg-primary/10 text-foreground',
    warning: 'border-amber-500/30 bg-amber-500/10 text-foreground',
    urgent: 'border-red-500/35 bg-red-500/10 text-foreground',
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-[-10rem] top-64 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-[28rem] h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
      </div>
      <PublicHeader />
      {notices.enabled && notices.text && (
        <div className="relative z-20 px-6 lg:px-10 mt-16 lg:mt-20">
          <div className={`max-w-7xl mx-auto border px-4 py-3 text-sm ${noticeToneClasses[notices.tone] || noticeToneClasses.info}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>{notices.text}</p>
              {notices.linkLabel && notices.linkUrl && (
                <a href={notices.linkUrl} className="text-primary font-medium hover:underline">
                  {notices.linkLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="relative z-10 flex-1 pb-36 md:pb-0">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}
