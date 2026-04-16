import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import PageHero from '@/components/shared/PageHero';
import Seo from '@/components/shared/Seo';
import { FileDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Downloads() {
  const [query, setQuery] = useState('');
  const { data: docs = [] } = useQuery({
    queryKey: ['downloads-docs'],
    queryFn: () => firebaseApi.entities.ArchiveDocument.filter({ published: true }, '-created_date'),
    initialData: [],
  });

  const filtered = docs.filter((doc) => ['forms', 'public_notice', 'funeral_programme'].includes(doc.category) || (doc.tags || []).includes('download'))
    .filter((doc) => `${doc.title || ''} ${doc.description || ''} ${doc.preview_text || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Seo
        title="Downloads & Forms"
        description="Find public forms, programme downloads, and official notice files for the Awutu Bawjiase community."
      />
      <PageHero
        label="Downloads"
        title="Downloads & Forms"
        description="Quick access to public forms, funeral programmes, and downloadable notices without searching the full archive."
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search downloads..." className="pl-10 bg-card" />
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((doc) => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="surface-panel rounded-sm p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center border border-primary/20 bg-primary/10">
                      <FileDown className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-primary mt-2">{doc.category?.replace(/_/g, ' ')}</p>
                      {(doc.preview_text || doc.description) && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{doc.preview_text || doc.description}</p>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="surface-panel rounded-sm p-8 text-center">
              <p className="text-muted-foreground">No downloads matched your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
