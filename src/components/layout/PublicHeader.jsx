import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Crown, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from '../shared/DarkModeToggle';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import HiddenAdminAccessDialog from '@/components/auth/HiddenAdminAccessDialog';
import { useAuth } from '@/lib/AuthContext';


export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const location = useLocation();
  const longPressTimer = useRef(null);
  const { t } = useLanguage();
  const { appPublicSettings } = useAuth();
  const siteName = appPublicSettings?.siteName || 'Awutu Bawjiase';
  const [siteNameFirst = 'Awutu', ...siteNameRest] = siteName.split(' ');
  const siteNameSecond = siteNameRest.join(' ') || 'Bawjiase';
  const headerSettings = appPublicSettings?.header || {};

  const navGroups = [
    {
      labelKey: 'theBeginning',
      items: [
        { labelKey: 'home', path: '/' },
      ],
    },
    {
      labelKey: 'thePast',
      items: [
        { labelKey: 'communityHistory', path: '/history' },
        { labelKey: 'kingsArchive', path: '/kings' },
        { labelKey: 'royalLineage', path: '/lineage' },
        { labelKey: 'familyTree', path: '/family-tree' },
        { labelKey: 'documents', path: '/documents' },
      ],
    },
    {
      labelKey: 'thePresent',
      items: [
        { labelKey: 'memorial', path: '/memorial' },
        { labelKey: 'funeral', path: '/funeral' },
        { labelKey: 'news', path: '/news' },
        { labelKey: 'events', path: '/events' },
      ],
    },
    {
      labelKey: 'theFuture',
      items: [
        { labelKey: 'about', path: '/about' },
        { labelKey: 'gallery', path: '/gallery' },
        { labelKey: 'videosPortal', path: '/videos' },
        { labelKey: 'contact', path: '/contact' },
      ],
    },
  ];

  const flatNav = [
    { labelKey: 'home', path: '/' },
    { labelKey: 'about', path: '/about' },
    { labelKey: 'history', path: '/history' },
    { labelKey: 'kings', path: '/kings' },
    { labelKey: 'memorial', path: '/memorial' },
    { labelKey: 'funeral', path: '/funeral' },
    { labelKey: 'gallery', path: '/gallery' },
    { labelKey: 'videosPortal', path: '/videos' },
    { labelKey: 'news', path: '/news' },
    { labelKey: 'contact', path: '/contact' },
  ];

  const handleLogoMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setAdminDialogOpen(true);
    }, 900);
  };

  const handleLogoMouseUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleLogoTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setAdminDialogOpen(true);
    }, 900);
  };

  const handleLogoTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  return (
    <>
      <HiddenAdminAccessDialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen} />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/72 backdrop-blur-xl border-b border-border/50 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link
              to="/"
              className="flex items-center gap-3 select-none"
              onMouseDown={handleLogoMouseDown}
              onMouseUp={handleLogoMouseUp}
              onMouseLeave={handleLogoMouseUp}
              onTouchStart={handleLogoTouchStart}
              onTouchEnd={handleLogoTouchEnd}
            >
              <div className="flex h-11 w-11 items-center justify-center bg-primary/10 ring-1 ring-primary/15" style={{ borderRadius: '9999px' }}>
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <span className="text-foreground">
                <span className="hidden lg:block font-display text-2xl font-semibold tracking-wide">
                  {siteName}
                </span>
                <span className="block lg:hidden font-display text-[1.1rem] font-semibold leading-[0.88] tracking-[0.01em]">
                  <span className="block">{siteNameFirst}</span>
                  <span className="block mt-0.5">{siteNameSecond}</span>
                </span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {flatNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm tracking-wide transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2 py-1 shadow-sm backdrop-blur">
              {headerSettings.showSearch !== false && (
                <Link to="/search" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                  <Search className="w-4 h-4" />
                </Link>
              )}
              {headerSettings.showLanguageSwitcher !== false && <LanguageSwitcher />}
              {headerSettings.showDarkModeToggle !== false && <DarkModeToggle />}
              <button
                onClick={() => setMenuOpen((current) => !current)}
                className="lg:hidden p-2 text-foreground"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-background/35 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-4 right-4 top-[3.85rem] bottom-4 z-[60] lg:hidden"
            >
              <div className="h-full overflow-hidden border border-border/70 bg-background/92 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <div className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <Crown className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold leading-none text-foreground">{siteName}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{t('mobileNavigation')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-10 w-10 items-center justify-center border border-border/60 bg-background/70 text-foreground transition-colors hover:bg-muted/70"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="h-[calc(100%-5.25rem)] overflow-y-auto px-4 py-4">
                  <div className="space-y-4">
                    {navGroups.map((group) => (
                      <div key={group.labelKey} className="border border-border/60 bg-card/55 p-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-primary font-medium mb-3">
                          {t(group.labelKey)}
                        </p>
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-3 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-muted/70'
                                }`}
                              >
                                <span>{t(item.labelKey)}</span>
                                <ArrowRight className="w-4 h-4 opacity-70" />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
