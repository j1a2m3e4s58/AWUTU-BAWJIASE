import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck } from 'lucide-react';

export default function AdminActivity() {
  const [search, setSearch] = useState('');
  const { data: logs = [] } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => firebaseApi.entities.AuditLog.list('-created_date'),
    initialData: [],
  });

  const filtered = logs.filter((log) => {
    const haystack = `${log.action || ''} ${log.actor_name || ''} ${log.summary || ''} ${log.target_type || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Activity Log</h2>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            Review important admin actions like replies, deletions, and moderation changes.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-sidebar-foreground/40" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search activity..."
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((log) => (
          <div key={log.id} className="rounded-lg border border-sidebar-border bg-sidebar-accent p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">{log.summary}</p>
                <p className="text-xs text-sidebar-foreground/55 mt-1">
                  {log.actor_name || 'Admin'} • {log.action} • {log.target_type}
                </p>
              </div>
              <p className="text-xs text-sidebar-foreground/40">
                {log.created_date && new Date(log.created_date).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-sidebar-border p-10 text-center text-sidebar-foreground/55">
            <ShieldCheck className="w-8 h-8 mx-auto mb-3" />
            No activity logs found.
          </div>
        )}
      </div>
    </div>
  );
}
