import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Reply, Trash2, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { logAdminActivity } from '@/lib/adminAudit';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Feedback' },
  { value: 'gallery_item', label: 'Image Comments' },
  { value: 'training_video', label: 'Video Comments' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'spam', label: 'Spam' },
  { value: 'reported', label: 'Reported' },
];

export default function AdminComments() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => firebaseApi.entities.Comment.list('-created_date'),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => firebaseApi.entities.Comment.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment deleted');
      logAdminActivity({
        action: 'delete_comment',
        actorName: user?.displayName || user?.email || 'Admin',
        actorEmail: user?.email || '',
        targetType: 'comment',
        targetId: String(id),
        summary: 'Deleted a comment or reply from admin moderation.',
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (payload) => firebaseApi.entities.Comment.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted');
      logAdminActivity({
        action: 'reply_comment',
        actorName: user?.displayName || user?.email || 'Admin',
        actorEmail: user?.email || '',
        targetType: 'comment',
        targetId: created.id,
        summary: 'Posted an admin reply to a public comment.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.Comment.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment updated');
      logAdminActivity({
        action: 'moderate_comment',
        actorName: user?.displayName || user?.email || 'Admin',
        actorEmail: user?.email || '',
        targetType: 'comment',
        targetId: String(variables.id),
        summary: `Changed comment moderation status to ${variables.data.moderation_status}.`,
        metadata: variables.data,
      });
    },
  });

  const filteredComments = useMemo(
    () => comments.filter((comment) => {
      const matchesType = filter === 'all' || comment.target_type === filter;
      const matchesStatus = statusFilter === 'all' || (comment.moderation_status || 'approved') === statusFilter;
      const haystack = `${comment.author_name || ''} ${comment.content || ''} ${comment.target_type || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    }),
    [comments, filter, search, statusFilter]
  );

  const rootComments = useMemo(
    () => filteredComments.filter((comment) => !comment.parent_id),
    [filteredComments]
  );

  const repliesByParent = useMemo(() => {
    return filteredComments.reduce((accumulator, comment) => {
      if (!comment.parent_id) {
        return accumulator;
      }

      accumulator[comment.parent_id] = accumulator[comment.parent_id] || [];
      accumulator[comment.parent_id].push(comment);
      return accumulator;
    }, {});
  }, [filteredComments]);

  const submitReply = (comment) => {
    if (!replyText.trim()) {
      return;
    }

    replyMutation.mutate({
      target_type: comment.target_type,
      target_id: comment.target_id,
      parent_id: comment.id,
      author_name: 'Admin',
      content: replyText.trim(),
      is_admin: true,
      published: true,
      moderation_status: 'approved',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Comments & Replies</h2>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            Moderate image and video discussions, reply from admin, and delete any comment at any time.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-sidebar-foreground/40" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search comments..."
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
          <div className="w-full md:w-56">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rootComments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-sidebar-border bg-sidebar-accent p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-sidebar-foreground">{comment.author_name}</p>
                  <span className="rounded-full bg-sidebar border border-sidebar-border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                    {comment.target_type === 'gallery_item' ? 'Image Comment' : 'Video Comment'}
                  </span>
                  <span className="rounded-full bg-sidebar border border-sidebar-border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                    {comment.moderation_status || 'approved'}
                  </span>
                </div>
                <p className="text-xs text-sidebar-foreground/50">
                  {comment.created_date && new Date(comment.created_date).toLocaleString()}
                </p>
                <p className="text-sm text-sidebar-foreground/80 whitespace-pre-wrap pt-2">{comment.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-36">
                  <Select
                    value={comment.moderation_status || 'approved'}
                    onValueChange={(value) =>
                      updateMutation.mutate({
                        id: comment.id,
                        data: {
                          moderation_status: value,
                          published: value === 'approved',
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 bg-sidebar border-sidebar-border text-sidebar-foreground text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sidebar-foreground/70"
                >
                  <Reply className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(comment.id)}
                  className="text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {repliesByParent[comment.id]?.length > 0 && (
              <div className="mt-4 space-y-3 border-l border-sidebar-border pl-4">
                {repliesByParent[comment.id].map((reply) => (
                  <div key={reply.id} className="rounded-lg bg-sidebar p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-sidebar-foreground">{reply.author_name}</p>
                        {reply.is_admin && (
                          <span className="rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sidebar-primary">
                            Admin
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(reply.id)}
                        className="h-8 w-8 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-sidebar-foreground/50 mt-1">
                      {reply.created_date && new Date(reply.created_date).toLocaleString()}
                    </p>
                    <p className="text-sm text-sidebar-foreground/80 whitespace-pre-wrap mt-2">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="mt-4 rounded-lg border border-sidebar-border bg-sidebar p-4 space-y-3">
                <Input
                  value="Admin"
                  readOnly
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
                <Textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  rows={3}
                  placeholder="Write an admin reply..."
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setReplyingTo(null)} className="border-sidebar-border text-sidebar-foreground">
                    Cancel
                  </Button>
                  <Button onClick={() => submitReply(comment)} disabled={replyMutation.isPending}>
                    {replyMutation.isPending ? 'Replying...' : 'Post Reply'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {rootComments.length === 0 && (
          <div className="rounded-xl border border-dashed border-sidebar-border p-10 text-center text-sidebar-foreground/55">
            <ShieldCheck className="w-8 h-8 mx-auto mb-3" />
            No comments yet.
          </div>
        )}
      </div>
    </div>
  );
}
