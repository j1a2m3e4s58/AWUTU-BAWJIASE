import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, MessageSquare, Crown, FileText } from 'lucide-react';

export default function AdminAnalytics() {
  const { data: tributes } = useQuery({ queryKey: ['an-tributes'], queryFn: () => firebaseApi.entities.TributeMessage.list('-created_date', 100), initialData: [] });
  const { data: messages } = useQuery({ queryKey: ['an-messages'], queryFn: () => firebaseApi.entities.ContactMessage.list('-created_date', 100), initialData: [] });
  const { data: kings } = useQuery({ queryKey: ['an-kings'], queryFn: () => firebaseApi.entities.King.list(), initialData: [] });
  const { data: docs } = useQuery({ queryKey: ['an-docs'], queryFn: () => firebaseApi.entities.ArchiveDocument.list(), initialData: [] });

  // Group tributes by day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const tributesByDay = last14.map((day) => ({
    date: day.slice(5),
    tributes: tributes.filter(t => t.created_date?.slice(0, 10) === day).length,
    messages: messages.filter(m => m.created_date?.slice(0, 10) === day).length,
  }));

  const stats = [
    { label: 'Total Kings', value: kings.length, icon: Crown, color: 'text-yellow-400' },
    { label: 'Total Tributes', value: tributes.length, icon: MessageSquare, color: 'text-pink-400' },
    { label: 'Unread Messages', value: messages.filter(m => !m.read).length, icon: Users, color: 'text-red-400' },
    { label: 'Documents', value: docs.length, icon: FileText, color: 'text-cyan-400' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-sidebar-primary" />
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Analytics</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 bg-sidebar-accent rounded-lg border border-sidebar-border">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="text-2xl font-semibold text-sidebar-foreground">{s.value}</p>
            <p className="text-xs text-sidebar-foreground/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-sidebar-accent rounded-lg border border-sidebar-border p-6 mb-6">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-4">Tributes & Messages (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={tributesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 25%)" />
            <XAxis dataKey="date" stroke="hsl(220 10% 55%)" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(220 10% 55%)" tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'hsl(220 20% 10%)', border: '1px solid hsl(220 15% 20%)', borderRadius: '4px', color: '#fff' }} />
            <Line type="monotone" dataKey="tributes" stroke="hsl(38 45% 55%)" strokeWidth={2} dot={false} name="Tributes" />
            <Line type="monotone" dataKey="messages" stroke="hsl(200 70% 55%)" strokeWidth={2} dot={false} name="Messages" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-sidebar-accent rounded-lg border border-sidebar-border p-6">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-4">Kings by Status</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[
            { status: 'Deceased', count: kings.filter(k => k.status === 'deceased').length },
            { status: 'Reigning', count: kings.filter(k => k.status === 'reigning').length },
            { status: 'Abdicated', count: kings.filter(k => k.status === 'abdicated').length },
            { status: 'Future', count: kings.filter(k => k.status === 'future').length },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 25%)" />
            <XAxis dataKey="status" stroke="hsl(220 10% 55%)" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(220 10% 55%)" tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'hsl(220 20% 10%)', border: '1px solid hsl(220 15% 20%)', borderRadius: '4px', color: '#fff' }} />
            <Bar dataKey="count" fill="hsl(38 45% 55%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}