import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Crown, Image, Megaphone, Calendar, FileText, MessageSquare, Mail, BookOpen, Settings, ShieldCheck, Bell, Plus, PlaySquare, ImagePlus, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { data: kings } = useQuery({ queryKey: ['a-kings'], queryFn: () => firebaseApi.entities.King.list(), initialData: [] });
  const { data: gallery } = useQuery({ queryKey: ['a-gallery'], queryFn: () => firebaseApi.entities.GalleryItem.list(), initialData: [] });
  const { data: announcements } = useQuery({ queryKey: ['a-ann'], queryFn: () => firebaseApi.entities.Announcement.list(), initialData: [] });
  const { data: events } = useQuery({ queryKey: ['a-events'], queryFn: () => firebaseApi.entities.CommunityEvent.list(), initialData: [] });
  const { data: docs } = useQuery({ queryKey: ['a-docs'], queryFn: () => firebaseApi.entities.ArchiveDocument.list(), initialData: [] });
  const { data: tributes } = useQuery({ queryKey: ['a-tributes'], queryFn: () => firebaseApi.entities.TributeMessage.list(), initialData: [] });
  const { data: messages } = useQuery({ queryKey: ['a-messages'], queryFn: () => firebaseApi.entities.ContactMessage.list(), initialData: [] });
  const { data: history } = useQuery({ queryKey: ['a-history'], queryFn: () => firebaseApi.entities.HistoryContent.list(), initialData: [] });
  const { data: comments } = useQuery({ queryKey: ['a-comments'], queryFn: () => firebaseApi.entities.Comment.list(), initialData: [] });
  const { data: auditLogs } = useQuery({ queryKey: ['a-audit'], queryFn: () => firebaseApi.entities.AuditLog.list('-created_date', 5), initialData: [] });

  const unreadMessages = messages.filter((m) => !m.read).length;
  const freshComments = comments.filter((c) => !c.parent_id && !c.is_admin).length;
  const freshReplies = comments.filter((c) => c.parent_id && !c.is_admin).length;
  const upcomingEvents = events
    .filter((event) => event.date && new Date(event.date) >= new Date())
    .sort((left, right) => new Date(left.date) - new Date(right.date))
    .slice(0, 3);
  const recentUploads = [
    ...gallery.map((item) => ({ ...item, type: 'Gallery', path: '/admin/gallery' })),
    ...docs.map((item) => ({ ...item, type: 'Document', path: '/admin/documents' })),
    ...announcements.filter((item) => item.attachment_url).map((item) => ({ ...item, type: 'Announcement File', path: '/admin/announcements' })),
  ]
    .sort((left, right) => new Date(right.created_date || 0) - new Date(left.created_date || 0))
    .slice(0, 4);

  const cards = [
    { label: 'Kings', count: kings.length, icon: Crown, path: '/admin/kings', color: 'text-yellow-400' },
    { label: 'History', count: history.length, icon: BookOpen, path: '/admin/history', color: 'text-blue-400' },
    { label: 'Gallery', count: gallery.length, icon: Image, path: '/admin/gallery', color: 'text-green-400' },
    { label: 'Announcements', count: announcements.length, icon: Megaphone, path: '/admin/announcements', color: 'text-orange-400' },
    { label: 'Events', count: events.length, icon: Calendar, path: '/admin/events', color: 'text-purple-400' },
    { label: 'Documents', count: docs.length, icon: FileText, path: '/admin/documents', color: 'text-cyan-400' },
    { label: 'Tributes', count: tributes.length, icon: MessageSquare, path: '/admin/tributes', color: 'text-pink-400' },
    { label: 'Messages', count: unreadMessages, icon: Mail, path: '/admin/messages', color: 'text-red-400' },
    { label: 'Comments', count: comments.length, icon: MessageSquare, path: '/admin/comments', color: 'text-emerald-400' },
    { label: 'Site Settings', count: 1, icon: Settings, path: '/admin/site-settings', color: 'text-indigo-400' },
  ];
  const quickActions = [
    { label: 'Add Gallery Item', path: '/admin/gallery', icon: Image },
    { label: 'Add Video', path: '/admin/training', icon: PlaySquare },
    { label: 'Add Event', path: '/admin/events', icon: Calendar },
    { label: 'Add Announcement', path: '/admin/announcements', icon: Megaphone },
    { label: 'Add Document', path: '/admin/documents', icon: FileText },
    { label: 'Hero Banner', path: '/admin/hero-banners', icon: ImagePlus },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Overview</h2>
          <p className="mt-1 text-sm text-sidebar-foreground/60">
            Manage urgent updates, public content, and daily community feedback from one place.
          </p>
        </div>
        <Link
          to="/admin/media-library"
          className="inline-flex items-center gap-2 border border-sidebar-border bg-sidebar-accent px-4 py-2 text-sm text-sidebar-foreground hover:border-sidebar-primary/40"
        >
          <FolderOpen className="h-4 w-4 text-sidebar-primary" />
          Open Media Library
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="group flex items-center gap-3 border border-sidebar-border bg-sidebar-accent p-4 text-sidebar-foreground transition-colors hover:border-sidebar-primary/40"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-sidebar-border bg-sidebar text-sidebar-primary group-hover:border-sidebar-primary/40">
              <action.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium leading-tight">{action.label}</span>
            <Plus className="ml-auto h-4 w-4 text-sidebar-foreground/35" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="p-5 bg-sidebar-accent rounded-lg border border-sidebar-border hover:border-sidebar-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <span className="text-2xl font-semibold text-sidebar-foreground">{card.count}</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-sidebar-accent rounded-lg border border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-sidebar-primary" />
            <h3 className="text-sm font-medium text-sidebar-foreground">Admin Notifications</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-sidebar-foreground/75">{unreadMessages} unread contact message(s)</p>
            <p className="text-sidebar-foreground/75">{freshComments} public top-level comment(s)</p>
            <p className="text-sidebar-foreground/75">{freshReplies} public reply/replies</p>
          </div>
        </div>
        <div className="p-5 bg-sidebar-accent rounded-lg border border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-sidebar-primary" />
            <h3 className="text-sm font-medium text-sidebar-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id}>
                <p className="text-sm text-sidebar-foreground">{log.summary}</p>
                <p className="text-xs text-sidebar-foreground/50 mt-1">
                  {log.created_date && new Date(log.created_date).toLocaleString()}
                </p>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-sidebar-foreground/60">No admin activity yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-sidebar-accent border border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-sidebar-primary" />
            <h3 className="text-sm font-medium text-sidebar-foreground">Next Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to="/admin/events" className="block border border-sidebar-border bg-sidebar/45 p-3 hover:border-sidebar-primary/35">
                <p className="text-sm font-medium text-sidebar-foreground">{event.title}</p>
                <p className="mt-1 text-xs text-sidebar-foreground/55">
                  {new Date(event.date).toLocaleDateString()} {event.venue || event.location ? `· ${event.venue || event.location}` : ''}
                </p>
              </Link>
            ))}
            {upcomingEvents.length === 0 && <p className="text-sm text-sidebar-foreground/60">No upcoming events published yet.</p>}
          </div>
        </div>

        <div className="p-5 bg-sidebar-accent border border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-sidebar-primary" />
            <h3 className="text-sm font-medium text-sidebar-foreground">Recent Uploads</h3>
          </div>
          <div className="space-y-3">
            {recentUploads.map((item) => (
              <Link key={`${item.type}-${item.id}`} to={item.path} className="flex items-center justify-between gap-3 border border-sidebar-border bg-sidebar/45 p-3 hover:border-sidebar-primary/35">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sidebar-foreground/45">{item.type}</p>
                </div>
                <span className="text-xs text-sidebar-primary">Manage</span>
              </Link>
            ))}
            {recentUploads.length === 0 && <p className="text-sm text-sidebar-foreground/60">No recent media uploads yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
