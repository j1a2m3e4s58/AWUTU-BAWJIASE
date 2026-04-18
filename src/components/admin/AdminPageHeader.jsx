import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPageHeader({
  title,
  description,
  action = null,
  onRefresh,
  refreshing = false,
}) {
  return (
    <div className="sticky top-0 z-10 -mx-2 mb-6 border-b border-sidebar-border/70 bg-sidebar/92 px-2 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-sidebar-foreground/60">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2 border-sidebar-border text-sidebar-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {action}
        </div>
      </div>
    </div>
  );
}
