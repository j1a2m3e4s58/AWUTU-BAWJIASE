import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';

const downloadTextFile = (filename, content, type = 'application/json') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const toCsv = (items) => {
  if (!items.length) return '';
  const headers = Array.from(new Set(items.flatMap((item) => Object.keys(item))));
  const rows = items.map((item) => headers.map((header) => JSON.stringify(item[header] ?? '')).join(','));
  return [headers.join(','), ...rows].join('\n');
};

export default function AdminBackups() {
  const queries = {
    kings: useQuery({ queryKey: ['backup-kings'], queryFn: () => firebaseApi.entities.King.list('order'), initialData: [] }),
    events: useQuery({ queryKey: ['backup-events'], queryFn: () => firebaseApi.entities.CommunityEvent.list('-date'), initialData: [] }),
    documents: useQuery({ queryKey: ['backup-docs'], queryFn: () => firebaseApi.entities.ArchiveDocument.list('-created_date'), initialData: [] }),
    messages: useQuery({ queryKey: ['backup-messages'], queryFn: () => firebaseApi.entities.ContactMessage.list('-created_date'), initialData: [] }),
    comments: useQuery({ queryKey: ['backup-comments'], queryFn: () => firebaseApi.entities.Comment.list('-created_date'), initialData: [] }),
    announcements: useQuery({ queryKey: ['backup-announcements'], queryFn: () => firebaseApi.entities.Announcement.list('-created_date'), initialData: [] }),
  };

  const collections = [
    { key: 'kings', label: 'Leadership Profiles' },
    { key: 'events', label: 'Events' },
    { key: 'documents', label: 'Documents' },
    { key: 'messages', label: 'Messages' },
    { key: 'comments', label: 'Comments' },
    { key: 'announcements', label: 'Announcements' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Backup & Export Tools</h2>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Export important collections to JSON or CSV before deployment or during regular backups.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => {
          const items = queries[collection.key].data || [];
          return (
            <div key={collection.key} className="border border-sidebar-border bg-sidebar-accent p-5 space-y-4">
              <div>
                <p className="font-medium text-sidebar-foreground">{collection.label}</p>
                <p className="text-sm text-sidebar-foreground/55 mt-1">{items.length} record(s)</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => downloadTextFile(`${collection.key}.json`, JSON.stringify(items, null, 2))}>
                  Export JSON
                </Button>
                <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => downloadTextFile(`${collection.key}.csv`, toCsv(items), 'text/csv')}>
                  Export CSV
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
