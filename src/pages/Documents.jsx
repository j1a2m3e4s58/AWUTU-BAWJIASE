import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHero from '../components/shared/PageHero';
import Seo from '@/components/shared/Seo';
import { useLanguage } from '@/lib/LanguageContext';
import { getLocalizedField } from '@/lib/localizedContent';

export default function Documents() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => firebaseApi.entities.ArchiveDocument.filter({ published: true }, '-created_date'),
    initialData: [],
  });

  const filtered = docs.filter((d) => {
    const searchText = `${d.title || ''} ${d.description || ''} ${d.preview_text || ''}`.toLowerCase();
    const matchSearch = searchText.includes(search.toLowerCase());
    const matchCat = category === 'all' || d.category === category;
    return matchSearch && matchCat;
  });
  const featuredDocs = filtered.filter((item) => item.featured).slice(0, 3);

  return (
    <div>
      <Seo
        title="Documents"
        description="Browse decrees, historical documents, genealogy materials, and archive records from the Awutu Bawjiase community."
      />
      <PageHero label={t('documentsLabel')} title={t('documentsTitle')} description={t('documentsDesc')} pageKey="documents" />

      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {featuredDocs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 mb-10">
              {featuredDocs.map((doc) => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="surface-panel rounded-sm p-5 hover:border-primary/30 transition-colors">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary mb-3">{t('featuredDocument')}</p>
                  <p className="font-medium">{getLocalizedField(doc, 'title', lang)}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{getLocalizedField(doc, 'preview_text', lang) || getLocalizedField(doc, 'description', lang)}</p>
                </a>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchDocuments')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48 bg-card">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories2')}</SelectItem>
                <SelectItem value="royal_decree">Royal Decrees</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="genealogy">Genealogy</SelectItem>
                <SelectItem value="ceremony">Ceremony</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="chieftaincy_record">Chieftaincy Records</SelectItem>
                <SelectItem value="funeral_programme">Funeral Programmes</SelectItem>
                <SelectItem value="public_notice">Public Notices</SelectItem>
                <SelectItem value="forms">Forms</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noDocuments')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                >
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  className="flex flex-col gap-4 p-4 surface-panel rounded-sm hover:border-primary/30 transition-colors group sm:flex-row sm:items-center"
                  >
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">{getLocalizedField(doc, 'title', lang)}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{doc.category?.replace(/_/g, ' ')}</span>
                        {doc.created_date && (
                          <>
                            <span>·</span>
                            <span>{new Date(doc.created_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {(doc.preview_text || doc.description) && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{getLocalizedField(doc, 'preview_text', lang) || getLocalizedField(doc, 'description', lang)}</p>
                      )}
                    </div>
                    <div className="flex w-full items-center justify-between text-left sm:block sm:w-auto sm:text-right">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-primary mb-1">{doc.download_label || t('download')}</p>
                      <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-auto" />
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

