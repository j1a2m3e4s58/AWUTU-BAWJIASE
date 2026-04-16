import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAccess } from '@/lib/AdminAccessContext';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import {
  Crown, FileText, Image, Megaphone, Calendar,
  BookOpen, MessageSquare, Mail, Home, Menu, X, LogOut, ScrollText, TrendingUp, PlaySquare, Settings, ShieldCheck, FolderOpen, Database, ImagePlus
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: Home },
  { label: 'Kings', path: '/admin/kings', icon: Crown },
  { label: 'History Content', path: '/admin/history', icon: BookOpen },
  { label: 'Gallery', path: '/admin/gallery', icon: Image },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Tributes', path: '/admin/tributes', icon: MessageSquare },
  { label: 'Messages', path: '/admin/messages', icon: Mail },
  { label: 'Comments', path: '/admin/comments', icon: MessageSquare },
  { label: 'Activity Log', path: '/admin/activity', icon: ShieldCheck },
  { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
  { label: 'Videos Portal', path: '/admin/training', icon: PlaySquare },
  { label: 'Hero Banners', path: '/admin/hero-banners', icon: ImagePlus },
  { label: 'Media Library', path: '/admin/media-library', icon: FolderOpen },
  { label: 'Backups', path: '/admin/backups', icon: Database },
  { label: 'Site Settings', path: '/admin/site-settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAdminAccess();
  const { data: messages = [] } = useQuery({ queryKey: ['nav-messages'], queryFn: () => firebaseApi.entities.ContactMessage.list('-created_date'), initialData: [] });
  const { data: comments = [] } = useQuery({ queryKey: ['nav-comments'], queryFn: () => firebaseApi.entities.Comment.list('-created_date'), initialData: [] });
  const notificationCounts = {
    '/admin/messages': messages.filter((message) => !message.read).length,
    '/admin/comments': comments.filter((comment) => !comment.parent_id && (comment.moderation_status || 'approved') === 'approved' && !comment.is_admin).length,
  };

  const handleLogout = () => {
    logout();
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-3 top-3 bottom-3 z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden border border-sidebar-border/90 bg-sidebar/90 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out lg:static lg:inset-auto lg:w-64 lg:max-w-none lg:flex-none lg:border-r lg:border-t-0 lg:border-b-0 lg:border-l-0 lg:bg-sidebar lg:shadow-none lg:backdrop-blur-none ${
        sidebarOpen
          ? 'translate-x-0 pointer-events-auto'
          : 'translate-x-[calc(-100%-1rem)] pointer-events-none lg:translate-x-0 lg:pointer-events-auto'
      }`}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border/85 bg-sidebar/70 px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-sidebar-primary" />
            <span className="font-display text-lg font-semibold text-sidebar-foreground">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/95 hover:bg-sidebar-accent/90 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/90'}`} />
                <span className="flex-1">{item.label}</span>
                {notificationCounts[item.path] > 0 && (
                  <span className="min-w-5 px-1.5 py-0.5 text-[10px] text-sidebar-primary bg-sidebar-accent border border-sidebar-border">
                    {notificationCounts[item.path]}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/80 p-4">
          <Link
            to="/"
            className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/95 transition-colors hover:bg-sidebar-accent/90 hover:text-sidebar-foreground"
          >
            <ScrollText className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/95 transition-colors hover:bg-sidebar-accent/90 hover:text-sidebar-foreground"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-6 h-16 border-b border-sidebar-border bg-sidebar">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="relative z-10 flex h-10 w-10 items-center justify-center border border-sidebar-border bg-sidebar-accent/80 text-sidebar-foreground backdrop-blur-sm lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-medium text-sidebar-foreground">
            Royal Heritage Admin
          </h1>
        </header>
        <main className="flex-1 p-6 lg:p-8 bg-sidebar overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
