import React from 'react';
import { Button } from '@/components/ui/button';

export default function BilingualFieldHelper({ sourceValue, targetValue, onUseDraft, onClear, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onUseDraft}
        disabled={!sourceValue?.trim()}
        className="border-sidebar-border text-sidebar-foreground"
      >
        Use English Draft
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={!targetValue?.trim()}
        className="border-sidebar-border text-sidebar-foreground"
      >
        Clear Twi
      </Button>
      <p className="text-[11px] text-sidebar-foreground/50">
        Quick helper: copy the English text into the Twi field, then edit it when ready.
      </p>
    </div>
  );
}
