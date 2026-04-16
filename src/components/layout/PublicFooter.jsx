import React from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export default function PublicFooter() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const siteName = appPublicSettings?.siteName || 'Awutu Bawjiase';
  const footerSettings = lang === 'en' ? appPublicSettings?.footer || {} : {};
  const quickLinks = Array.isArray(footerSettings.quickLinks) ? footerSettings.quickLinks : [];
  const socialLinks = Array.isArray(footerSettings.socialLinks) ? footerSettings.socialLinks : [];
  const linkLabelByPath = {
    '/': 'home',
    '/about': 'about',
    '/history': 'communityHistory',
    '/kings': 'kingsArchive',
    '/leadership': 'leadership',
    '/lineage': 'royalLineage',
    '/family-tree': 'familyTree',
    '/documents': 'documents',
    '/downloads': 'documents',
    '/memorial': 'memorial',
    '/funeral': 'funeralInformation',
    '/news': 'news',
    '/events': 'events',
    '/gallery': 'gallery',
    '/videos': 'videosPortal',
    '/search': 'search',
    '/guidance': 'visitorGuidance',
    '/contact': 'contact',
  };
  const getLinkLabel = (item) => {
    const key = linkLabelByPath[item.path || item.url || ''];
    return key ? t(key) : item.label;
  };
  return (
    <footer className="border-t border-border/50 bg-card/75 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-40 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-lg font-semibold">{siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footerSettings.description || t('preservingHeritage')}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{t('heritage')}</p>
            <div className="space-y-3">
              <Link to="/history" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('communityHistory')}</Link>
              <Link to="/kings" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('kingsArchive')}</Link>
              <Link to="/lineage" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('royalLineage')}</Link>
              <Link to="/family-tree" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('familyTree')}</Link>
              <Link to="/documents" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('documents')}</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{t('current')}</p>
            <div className="space-y-3">
              <Link to="/memorial" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('memorial')}</Link>
              <Link to="/funeral" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('funeralInformation')}</Link>
              <Link to="/news" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('news')}</Link>
              <Link to="/events" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('events')}</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{t('connect')}</p>
            <div className="space-y-3">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('about')}</Link>
              <Link to="/gallery" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('gallery')}</Link>
              <Link to="/videos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('videosPortal')}</Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('search')}</Link>
              <Link to="/guidance" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('visitorGuidance')}</Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('contact')}</Link>
            </div>
          </div>
        </div>

        {(quickLinks.length > 0 || socialLinks.length > 0) && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-8">
            {quickLinks.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{t('quickLinks')}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {quickLinks.map((item, index) => (
                    <Link key={`${item.path}-${index}`} to={item.path || '/'} className="hover:text-foreground transition-colors">
                      {getLinkLabel(item)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-4">{t('communityLinks')}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {socialLinks.map((item, index) => (
                    <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Awutu Bawjiase Community Archive. {t('allRightsReserved')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{footerSettings.privacyLabel || t('privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{footerSettings.termsLabel || t('termsOfUse')}</Link>
            <span>{footerSettings.note || t('digitalSanctuary')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
