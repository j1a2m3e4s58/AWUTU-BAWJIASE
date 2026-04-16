import React, { useState, useRef, useEffect } from 'react';
import { languages } from '@/lib/LanguageContext';
import { useLanguage } from '@/lib/LanguageContext';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, switchLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find((l) => l.code === lang);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-sm transition-colors"
      >
        {current?.short}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-sm shadow-lg z-50 min-w-[110px]">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { switchLang(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${
                lang === l.code ? 'text-primary font-medium' : 'text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}