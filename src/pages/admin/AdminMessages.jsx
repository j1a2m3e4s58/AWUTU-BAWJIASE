import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Mail, MailOpen, Reply, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { logAdminActivity } from '@/lib/adminAudit';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminMessages() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');

  const { data: items } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => firebaseApi.entities.ContactMessage.list('-created_date'),
    initialData: [],
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.ContactMessage.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] });
      if (variables?.data?.admin_reply) {
        logAdminActivity({
          action: 'reply_message',
          actorName: user?.displayName || user?.email || 'Admin',
          actorEmail: user?.email || '',
          targetType: 'contact_message',
          targetId: String(variables.id),
          summary: 'Saved an admin reply for a contact message.',
        });
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.ContactMessage.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Deleted');
      logAdminActivity({
        action: 'delete_message',
        actorName: user?.displayName || user?.email || 'Admin',
        actorEmail: user?.email || '',
        targetType: 'contact_message',
        targetId: String(id),
        summary: 'Deleted a contact message from admin.',
      });
    },
  });

  const saveReply = (item) => {
    if (!replyText.trim()) {
      return;
    }

    updateMut.mutate({
      id: item.id,
      data: {
        read: true,
        replied: true,
        admin_reply: replyText.trim(),
        replied_date: new Date().toISOString(),
      },
    });
    setReplyText('');
    setReplyingTo(null);
    toast.success('Reply saved');
  };

  const filteredItems = items.filter((item) => {
    const haystack = `${item.name || ''} ${item.email || ''} ${item.subject || ''} ${item.message || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div>
      <AdminPageHeader
        title="Contact Messages"
        description="Review public inquiries, save replies, and keep the inbox organized."
        onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-messages'] })}
        action={
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-sidebar-foreground/40" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages..."
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
        }
      />

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 bg-sidebar-accent rounded-lg border border-sidebar-border ${!item.read ? 'border-l-2 border-l-sidebar-primary' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0" onClick={() => !item.read && updateMut.mutate({ id: item.id, data: { read: true } })}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-sidebar-foreground">{item.name}</p>
                  <span className="text-xs text-sidebar-foreground/50">{item.email}</span>
                </div>
                {item.subject && <p className="text-xs text-sidebar-primary mb-1">{item.subject}</p>}
                <p className="text-sm text-sidebar-foreground/80">{item.message}</p>
                <p className="text-xs text-sidebar-foreground/40 mt-2">
                  {item.created_date && new Date(item.created_date).toLocaleDateString()}
                </p>
                {item.admin_reply && (
                  <div className="mt-3 rounded-md border border-sidebar-border bg-sidebar p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-sidebar-primary">Admin Reply</p>
                    <p className="text-sm text-sidebar-foreground/80 whitespace-pre-wrap mt-2">{item.admin_reply}</p>
                    {item.replied_date && (
                      <p className="text-xs text-sidebar-foreground/40 mt-2">
                        Replied {new Date(item.replied_date).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setReplyingTo(replyingTo === item.id ? null : item.id);
                    setReplyText(item.admin_reply || '');
                  }}
                  className="h-8 w-8"
                >
                  <Reply className="w-4 h-4 text-sidebar-foreground/70" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateMut.mutate({ id: item.id, data: { read: !item.read } })}
                  className="h-8 w-8"
                >
                  {item.read ? <MailOpen className="w-4 h-4 text-sidebar-foreground/40" /> : <Mail className="w-4 h-4 text-sidebar-primary" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {replyingTo === item.id && (
              <div className="mt-4 rounded-lg border border-sidebar-border bg-sidebar p-4 space-y-3">
                <p className="text-xs text-sidebar-foreground/60">
                  Reply to: <span className="text-sidebar-foreground">{item.email}</span>
                </p>
                <Textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  rows={4}
                  placeholder="Write your reply or response notes here..."
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
                <div className="flex flex-wrap justify-between gap-3">
                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent(item.subject || 'Reply from Awutu Bawjiase Community Archive')}&body=${encodeURIComponent(replyText)}`}
                    className="inline-flex items-center rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/75 hover:text-sidebar-foreground transition-colors"
                  >
                    Open in Email App
                  </a>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setReplyingTo(null)} className="border-sidebar-border text-sidebar-foreground">
                      Cancel
                    </Button>
                    <Button onClick={() => saveReply(item)} disabled={updateMut.isPending}>
                      {updateMut.isPending ? 'Saving...' : 'Save Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredItems.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No messages found.</p>}
      </div>
    </div>
  );
}
