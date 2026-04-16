import PageHero from '@/components/shared/PageHero';
import Seo from '@/components/shared/Seo';

const sections = [
  {
    title: 'Information We Receive',
    body:
      'We collect only the information you choose to share with the archive, such as contact messages, tribute submissions, uploaded content, and basic analytics about how visitors use the public website.',
  },
  {
    title: 'How We Use It',
    body:
      'Submitted information is used to respond to inquiries, preserve approved historical content, manage public notices, and improve the experience of visitors who rely on this archive for community information.',
  },
  {
    title: 'Community Content Care',
    body:
      'Historical records, memorial tributes, family materials, and media should be reviewed before publication to protect sensitive information and respect the dignity of living families and elders.',
  },
  {
    title: 'Storage And Access',
    body:
      'Administrative access should remain limited to trusted custodians of the archive. Content exports and backups should be stored securely and reviewed regularly.',
  },
  {
    title: 'Contact About Privacy',
    body:
      'If a record, tribute, image, or document should be corrected or removed, visitors should use the public contact page so the archive team can review the request.',
  },
];

export default function Privacy() {
  return (
    <div>
      <Seo
        title="Privacy Policy"
        description="How the Awutu Bawjiase Community Archive handles visitor messages, tributes, documents, and cultural records."
      />
      <PageHero
        label="Site Policy"
        title="Privacy Policy"
        description="A simple guide to how visitor information, community records, and submitted content are handled on this public archive."
        pageKey="privacy"
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="surface-panel rounded-3xl p-8 lg:p-10 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-2xl font-semibold text-foreground">{section.title}</h2>
                <p className="mt-3 text-muted-foreground leading-7">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
