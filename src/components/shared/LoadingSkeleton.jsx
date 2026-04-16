import React from 'react';

export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export function KingCardSkeleton() {
  return (
    <div className="border border-border/50 rounded-sm overflow-hidden bg-card">
      <SkeletonBlock className="aspect-[3/4] w-full rounded-none" />
      <div className="p-5 space-y-2">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="p-5 border border-border/50 rounded-sm bg-card flex gap-4 items-center">
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
      <SkeletonBlock className="h-4 w-24" />
    </div>
  );
}