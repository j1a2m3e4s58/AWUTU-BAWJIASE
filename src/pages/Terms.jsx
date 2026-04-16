import PageHero from '@/components/shared/PageHero';
import Seo from '@/components/shared/Seo';

const sections = [
  {
    title: 'Purpose Of The Archive',
    body:
      'This website exists to present public information, preserve community memory, share ceremonial updates, and protect royal heritage materials for future generations.',
  },
  {
    title: 'Respectful Use',
    body:
      'Visitors should use the site respectfully. Submitted tributes, inquiries, and shared materials must not contain abuse, impersonation, misinformation, or content that harms the dignity of the community.',
  },
  {
    title: 'Historical Accuracy',
    body:
      'The archive team should review historical records and public notices before publication. Where materials are incomplete or disputed, they should be marked clearly and updated when better records become available.',
  },
  {
    title: 'Ownership And Permissions',
    body:
      'Images, documents, recordings, and ceremonial materials should only be uploaded when the archive has permission to publish them or a clear community right to preserve them.',
  },
  {
    title: 'Changes',
    body:
      'As the archive grows, these terms may be refined to reflect community governance, preservation standards, and public communication needs.',
  },
];

export default function Terms() {
  return (
    <div>
      <Seo
        title="Terms of Use"
        description="Public use guidelines for the Awutu Bawjiase Community Archive and its heritage materials."
      />
      <PageHero
        label="Site Policy"
        title="Terms of Use"
        description="Guidelines for using this archive respectfully and for publishing community materials responsibly."
        pageKey="terms"
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
