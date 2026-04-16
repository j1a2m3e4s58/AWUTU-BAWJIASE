import React from 'react';
import PageHero from '@/components/shared/PageHero';
import { useAuth } from '@/lib/AuthContext';
import Seo from '@/components/shared/Seo';

const SECTIONS = [
  { key: 'etiquette', title: 'Palace Etiquette' },
  { key: 'visitingProtocol', title: 'Visiting Protocol' },
  { key: 'dressExpectations', title: 'Dress Expectations' },
  { key: 'publicGuidance', title: 'Community Participation Guidance' },
];

export default function VisitorGuidance() {
  const { appPublicSettings } = useAuth();
  const guidance = appPublicSettings?.visitorGuidance || {};
  const visibleSections = SECTIONS.filter((section) => guidance[section.key]);

  return (
    <div>
      <Seo
        title="Visitor Guidance"
        description="Guidance for visitors, ceremony attendees, and community guests on palace etiquette, dress, and respectful participation."
      />
      <PageHero
        label={appPublicSettings?.pages?.guidance?.label || 'Visitor Guidance'}
        title={appPublicSettings?.pages?.guidance?.title || 'Palace Etiquette & Community Guidance'}
        description={appPublicSettings?.pages?.guidance?.description || 'Helpful guidance on visiting respectfully, taking part in ceremonies, and approaching community leadership well.'}
        pageKey="guidance"
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {visibleSections.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {visibleSections.map((section) => (
                <div key={section.key} className="surface-panel rounded-sm p-6 lg:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-3">{section.title}</p>
                  <p className="text-muted-foreground leading-8 whitespace-pre-wrap">{guidance[section.key]}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="surface-panel rounded-sm p-8 text-center">
              <p className="text-muted-foreground">Visitor guidance details will appear here after they are added from the admin settings.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
