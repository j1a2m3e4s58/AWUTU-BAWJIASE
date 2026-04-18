import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Reply } from 'lucide-react';
import { firebaseApi } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const INITIAL_FORM = { author_name: '', content: '' };

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

function CommentForm({ onSubmit, isPending, submitLabel = 'Post Comment', compact = false }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) {
      return;
    }

    onSubmit({
      author_name: form.author_name.trim(),
      content: form.content.trim(),
    });
    setForm(INITIAL_FORM);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'pt-3' : ''}`}>
      <Input
        value={form.author_name}
        onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))}
        placeholder="Your name"
        className="border-border/70 bg-background/70 text-foreground placeholder:text-muted-foreground"
      />
      <Textarea
        value={form.content}
        onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
        placeholder="Write a respectful comment..."
        rows={compact ? 3 : 4}
        className="border-border/70 bg-background/70 text-foreground placeholder:text-muted-foreground"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : submitLabel}
      </Button>
    </form>
  );
}

function CommentItem({ comment, replies, onReply, isPending, activeReplyId, setActiveReplyId }) {
  return (
    <div className="border border-border/60 bg-background/55 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{comment.author_name}</p>
            {comment.is_admin && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(comment.created_date)}</p>
        </div>
        {!comment.is_admin && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
          >
            <Reply className="w-3.5 h-3.5" />
            Reply
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{comment.content}</p>

      {activeReplyId === comment.id && (
        <CommentForm
          compact
          submitLabel="Post Reply"
          isPending={isPending}
          onSubmit={(payload) => {
            onReply(comment, payload);
            setActiveReplyId(null);
          }}
        />
      )}

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-border/70 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-card/70 p-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{reply.author_name}</p>
                {reply.is_admin && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">
                    Admin
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{formatDate(reply.created_date)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({ targetType, targetId, title = 'Comments' }) {
  const queryClient = useQueryClient();
  const [activeReplyId, setActiveReplyId] = useState(null);

  const queryKey = ['comments', targetType, targetId];

  const { data: comments = [] } = useQuery({
    queryKey,
    queryFn: () =>
      firebaseApi.entities.Comment.filter(
        {
          target_type: targetType,
          target_id: targetId,
          published: true,
          moderation_status: 'approved',
        },
        'created_date'
      ),
    enabled: Boolean(targetId),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (payload) => firebaseApi.entities.Comment.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['gallery-comments-counts'] });
      queryClient.invalidateQueries({ queryKey: ['training-comments-counts'] });
      toast.success('Comment posted');
    },
    onError: (error) => {
      toast.error(error?.message || 'Could not post comment');
    },
  });

  const rootComments = useMemo(
    () => comments.filter((comment) => !comment.parent_id),
    [comments]
  );

  const repliesByParent = useMemo(() => {
    return comments.reduce((accumulator, comment) => {
      if (!comment.parent_id) {
        return accumulator;
      }

      accumulator[comment.parent_id] = accumulator[comment.parent_id] || [];
      accumulator[comment.parent_id].push(comment);
      return accumulator;
    }, {});
  }, [comments]);

  const submitRootComment = (payload) => {
    createMutation.mutate({
      ...payload,
      target_type: targetType,
      target_id: targetId,
      published: true,
      is_admin: false,
      moderation_status: 'approved',
    });
  };

  const submitReply = (comment, payload) => {
    createMutation.mutate({
      ...payload,
      target_type: targetType,
      target_id: targetId,
      parent_id: comment.id,
      published: true,
      is_admin: false,
      moderation_status: 'approved',
    });
  };

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-display text-2xl font-semibold text-foreground">
          {title} ({comments.length})
        </h3>
      </div>

      <CommentForm onSubmit={submitRootComment} isPending={createMutation.isPending} />

      <div className="space-y-4">
        {rootComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={repliesByParent[comment.id] || []}
            onReply={submitReply}
            isPending={createMutation.isPending}
            activeReplyId={activeReplyId}
            setActiveReplyId={setActiveReplyId}
          />
        ))}
        {rootComments.length === 0 && (
          <div className="border border-dashed border-border/70 bg-background/35 p-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to contribute respectfully.
          </div>
        )}
      </div>
    </div>
  );
}
