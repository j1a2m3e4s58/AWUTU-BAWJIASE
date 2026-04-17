import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RequireAdmin from '@/components/auth/RequireAdmin';
import { AdminAccessProvider } from '@/lib/AdminAccessContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import History from './pages/History';
import Kings from './pages/Kings';
import KingProfile from './pages/KingProfile';
import Memorial from './pages/Memorial';
import Funeral from './pages/Funeral';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Events from './pages/Events';
import Lineage from './pages/Lineage';
import Documents from './pages/Documents';
import Contact from './pages/Contact';

// Extra public pages
import Search from './pages/Search';
import FamilyTree from './pages/FamilyTree';
import Training from './pages/Training';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import VisitorGuidance from './pages/VisitorGuidance';
import Downloads from './pages/Downloads';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKings from './pages/admin/AdminKings';
import AdminHistory from './pages/admin/AdminHistory';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminEvents from './pages/admin/AdminEvents';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminTributes from './pages/admin/AdminTributes';
import AdminMessages from './pages/admin/AdminMessages';
import AdminComments from './pages/admin/AdminComments';
import AdminActivity from './pages/admin/AdminActivity';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminTraining from './pages/admin/AdminTraining';
import AdminSiteSettings from './pages/admin/AdminSiteSettings';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';
import AdminBackups from './pages/admin/AdminBackups';
import AdminHeroBanners from './pages/admin/AdminHeroBanners';
import AdminLogin from './pages/admin/AdminLogin';
import AppLaunchCrest from '@/components/shared/AppLaunchCrest';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  React.useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      return;
    }

    const scrollToPageTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.scrollingElement?.scrollTo?.(0, 0);
    };

    scrollToPageTop();
    const frame = window.requestAnimationFrame(scrollToPageTop);
    const timeout = window.setTimeout(scrollToPageTop, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [pathname, search, hash]);

  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/kings" element={<Kings />} />
        <Route path="/leadership" element={<Kings />} />
        <Route path="/kings/:id" element={<KingProfile />} />
        <Route path="/memorial" element={<Memorial />} />
        <Route path="/funeral" element={<Funeral />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/events" element={<Events />} />
        <Route path="/lineage" element={<Lineage />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="/guidance" element={<VisitorGuidance />} />
        <Route path="/family-tree" element={<FamilyTree />} />
        <Route path="/videos" element={<Training />} />
        <Route path="/training" element={<Navigate to="/videos" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Admin routes */}
      <Route element={<RequireAdmin authPending={isAdminRoute && isLoadingAuth} settingsPending={isLoadingPublicSettings} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/kings" element={<AdminKings />} />
          <Route path="/admin/history" element={<AdminHistory />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/tributes" element={<AdminTributes />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/training" element={<AdminTraining />} />
          <Route path="/admin/hero-banners" element={<AdminHeroBanners />} />
          <Route path="/admin/media-library" element={<AdminMediaLibrary />} />
          <Route path="/admin/backups" element={<AdminBackups />} />
          <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AdminAccessProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <AuthenticatedApp />
            </Router>
            <Toaster />
            <AppLaunchCrest />
          </QueryClientProvider>
        </LanguageProvider>
      </AdminAccessProvider>
    </AuthProvider>
  )
}

export default App
