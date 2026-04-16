import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseApi } from '@/api/firebaseClient';
import { getMergedPublicSettings } from '@/lib/siteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import BilingualFieldHelper from '@/components/admin/BilingualFieldHelper';

const PAGE_FIELDS = [
  { key: 'about', label: 'About' },
  { key: 'history', label: 'History' },
  { key: 'funeral', label: 'Funeral' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'news', label: 'News' },
  { key: 'events', label: 'Events' },
  { key: 'lineage', label: 'Lineage' },
  { key: 'leadership', label: 'Leadership Directory' },
  { key: 'documents', label: 'Documents' },
  { key: 'contact', label: 'Contact' },
  { key: 'guidance', label: 'Visitor Guidance' },
  { key: 'search', label: 'Search' },
  { key: 'videos', label: 'Videos Portal' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'terms', label: 'Terms' },
];

const deepSet = (source, path, value) => {
  const keys = path.split('.');
  const output = Array.isArray(source) ? [...source] : { ...source };
  let current = output;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return output;
};

const normalizeList = (value) => (Array.isArray(value) ? value : []);

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const { refreshPublicSettings } = useAuth();
  const [form, setForm] = useState(() => getMergedPublicSettings(null));

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: () => firebaseApi.siteSettings.getPublic(),
  });

  const mergedSettings = useMemo(() => getMergedPublicSettings(settings), [settings]);

  useEffect(() => {
    setForm(mergedSettings);
  }, [mergedSettings]);

  const saveMutation = useMutation({
    mutationFn: (payload) => firebaseApi.siteSettings.upsertPublic(payload),
    onSuccess: (data) => {
      const normalized = getMergedPublicSettings(data);
      queryClient.setQueryData(['admin-site-settings'], normalized);
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
      setForm(normalized);
      refreshPublicSettings().catch((error) => {
        console.error('Background public settings refresh failed:', error);
      });
      toast.success('Site settings saved');
    },
    onError: (error) => {
      console.error('Site settings save failed:', error);
      toast.error(error?.message || 'Failed to save site settings');
    },
  });

  const updateField = (path, value) => {
    setForm((current) => deepSet(current, path, value));
  };

  const handleReset = () => {
    setForm(mergedSettings);
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-sidebar-foreground">Site Settings</h2>
          <p className="text-sm text-sidebar-foreground/65 mt-1">
            Manage public content that appears across the site from the header to the footer.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-sidebar-border text-sidebar-foreground"
            disabled={saveMutation.isPending}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Site Identity</h3>
            <p className="text-sm text-sidebar-foreground/60">Main brand text used in the public header, footer, and homepage.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sidebar-foreground/70">Site Name</Label>
              <Input
                value={form.siteName}
                onChange={(event) => updateField('siteName', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Site Tagline</Label>
              <Input
                value={form.siteTagline}
                onChange={(event) => updateField('siteTagline', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Header Controls</h3>
            <p className="text-sm text-sidebar-foreground/60">Choose which tools stay visible in the public header.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.header.showSearch} onCheckedChange={(value) => updateField('header.showSearch', value)} />
              <Label className="text-sidebar-foreground/70">Show Search</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.header.showLanguageSwitcher} onCheckedChange={(value) => updateField('header.showLanguageSwitcher', value)} />
              <Label className="text-sidebar-foreground/70">Show Language Switcher</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.header.showDarkModeToggle} onCheckedChange={(value) => updateField('header.showDarkModeToggle', value)} />
              <Label className="text-sidebar-foreground/70">Show Theme Toggle</Label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Footer Content</h3>
            <p className="text-sm text-sidebar-foreground/60">Control the descriptive content shown in the public footer.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Footer Description</Label>
              <Textarea
                rows={3}
                value={form.footer.description}
                onChange={(event) => updateField('footer.description', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Copyright Name</Label>
              <Input
                value={form.footer.copyrightText}
                onChange={(event) => updateField('footer.copyrightText', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Footer Note</Label>
              <Input
                value={form.footer.note}
                onChange={(event) => updateField('footer.note', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Privacy Label</Label>
              <Input
                value={form.footer.privacyLabel}
                onChange={(event) => updateField('footer.privacyLabel', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Terms Label</Label>
              <Input
                value={form.footer.termsLabel}
                onChange={(event) => updateField('footer.termsLabel', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Public Contact Details</h3>
            <p className="text-sm text-sidebar-foreground/60">These details are shown on the public contact page and can be reused elsewhere later.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sidebar-foreground/70">Email</Label>
              <Input
                value={form.contact.email}
                onChange={(event) => updateField('contact.email', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Phone</Label>
              <Input
                value={form.contact.phone}
                onChange={(event) => updateField('contact.phone', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Address</Label>
              <Textarea
                rows={3}
                value={form.contact.address}
                onChange={(event) => updateField('contact.address', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Homepage Hero</h3>
            <p className="text-sm text-sidebar-foreground/60">Edit the main public landing message without changing code.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sidebar-foreground/70">Hero Label</Label>
              <Input
                value={form.home.label}
                onChange={(event) => updateField('home.label', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Hero Label (Twi)</Label>
              <Input
                value={form.home.label_twi || ''}
                onChange={(event) => updateField('home.label_twi', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <BilingualFieldHelper sourceValue={form.home.label} targetValue={form.home.label_twi} onUseDraft={() => updateField('home.label_twi', form.home.label)} onClear={() => updateField('home.label_twi', '')} />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Hero Title Accent</Label>
              <Input
                value={form.home.titleAccent}
                onChange={(event) => updateField('home.titleAccent', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Hero Title Accent (Twi)</Label>
              <Input
                value={form.home.titleAccent_twi || ''}
                onChange={(event) => updateField('home.titleAccent_twi', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <BilingualFieldHelper sourceValue={form.home.titleAccent} targetValue={form.home.titleAccent_twi} onUseDraft={() => updateField('home.titleAccent_twi', form.home.titleAccent)} onClear={() => updateField('home.titleAccent_twi', '')} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Hero Title Lead</Label>
              <Input
                value={form.home.titleLead}
                onChange={(event) => updateField('home.titleLead', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Hero Title Lead (Twi)</Label>
              <Input
                value={form.home.titleLead_twi || ''}
                onChange={(event) => updateField('home.titleLead_twi', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <BilingualFieldHelper sourceValue={form.home.titleLead} targetValue={form.home.titleLead_twi} onUseDraft={() => updateField('home.titleLead_twi', form.home.titleLead)} onClear={() => updateField('home.titleLead_twi', '')} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Hero Description</Label>
              <Textarea
                rows={3}
                value={form.home.description}
                onChange={(event) => updateField('home.description', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Hero Description (Twi)</Label>
              <Textarea
                rows={3}
                value={form.home.description_twi || ''}
                onChange={(event) => updateField('home.description_twi', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <BilingualFieldHelper sourceValue={form.home.description} targetValue={form.home.description_twi} onUseDraft={() => updateField('home.description_twi', form.home.description)} onClear={() => updateField('home.description_twi', '')} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Community Message</Label>
              <Textarea
                rows={3}
                value={form.home.communityMessage}
                onChange={(event) => updateField('home.communityMessage', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Community Message (Twi)</Label>
              <Textarea
                rows={3}
                value={form.home.communityMessage_twi || ''}
                onChange={(event) => updateField('home.communityMessage_twi', event.target.value)}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <BilingualFieldHelper sourceValue={form.home.communityMessage} targetValue={form.home.communityMessage_twi} onUseDraft={() => updateField('home.communityMessage_twi', form.home.communityMessage)} onClear={() => updateField('home.communityMessage_twi', '')} />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.home.sections.showLeadership} onCheckedChange={(value) => updateField('home.sections.showLeadership', value)} />
                <Label className="text-sidebar-foreground/70">Show Leadership</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.home.sections.showAnnouncements} onCheckedChange={(value) => updateField('home.sections.showAnnouncements', value)} />
                <Label className="text-sidebar-foreground/70">Show Announcements</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.home.sections.showEvents} onCheckedChange={(value) => updateField('home.sections.showEvents', value)} />
                <Label className="text-sidebar-foreground/70">Show Events</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.home.sections.showGallery} onCheckedChange={(value) => updateField('home.sections.showGallery', value)} />
                <Label className="text-sidebar-foreground/70">Show Gallery</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.home.sections.showVideos} onCheckedChange={(value) => updateField('home.sections.showVideos', value)} />
                <Label className="text-sidebar-foreground/70">Show Videos</Label>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Site Notice Banner</h3>
            <p className="text-sm text-sidebar-foreground/60">Post a temporary public update banner for funeral notices, urgent news, or community reminders.</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.notices.enabled} onCheckedChange={(value) => updateField('notices.enabled', value)} />
            <Label className="text-sidebar-foreground/70">Enable notice banner</Label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Notice Text</Label>
              <Textarea rows={3} value={form.notices.text} onChange={(event) => updateField('notices.text', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Link Label</Label>
              <Input value={form.notices.linkLabel} onChange={(event) => updateField('notices.linkLabel', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Link URL</Label>
              <Input value={form.notices.linkUrl} onChange={(event) => updateField('notices.linkUrl', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Memorial Programme</h3>
            <p className="text-sm text-sidebar-foreground/60">Manage obituary text, burial and thanksgiving details, family acknowledgements, and the downloadable programme file.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Programme Section Title</Label>
              <Input value={form.memorial.obituaryTitle} onChange={(event) => updateField('memorial.obituaryTitle', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sidebar-foreground/70">Obituary Text</Label>
              <Textarea rows={4} value={form.memorial.obituaryText} onChange={(event) => updateField('memorial.obituaryText', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Burial Details</Label>
              <Textarea rows={4} value={form.memorial.burialDetails} onChange={(event) => updateField('memorial.burialDetails', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Thanksgiving Details</Label>
              <Textarea rows={4} value={form.memorial.thanksgivingDetails} onChange={(event) => updateField('memorial.thanksgivingDetails', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Family Acknowledgements</Label>
              <Textarea rows={4} value={form.memorial.familyAcknowledgements} onChange={(event) => updateField('memorial.familyAcknowledgements', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Service Order</Label>
              <Textarea rows={4} value={form.memorial.serviceOrder} onChange={(event) => updateField('memorial.serviceOrder', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Programme File URL</Label>
              <Input value={form.memorial.programmeFileUrl} onChange={(event) => updateField('memorial.programmeFileUrl', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Programme Button Label</Label>
              <Input value={form.memorial.programmeLabel} onChange={(event) => updateField('memorial.programmeLabel', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Visitor Guidance</h3>
            <p className="text-sm text-sidebar-foreground/60">Control public etiquette, dress, and community participation guidance.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sidebar-foreground/70">Palace Etiquette</Label>
              <Textarea rows={4} value={form.visitorGuidance.etiquette} onChange={(event) => updateField('visitorGuidance.etiquette', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Visiting Protocol</Label>
              <Textarea rows={4} value={form.visitorGuidance.visitingProtocol} onChange={(event) => updateField('visitorGuidance.visitingProtocol', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Dress Expectations</Label>
              <Textarea rows={4} value={form.visitorGuidance.dressExpectations} onChange={(event) => updateField('visitorGuidance.dressExpectations', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Public Guidance</Label>
              <Textarea rows={4} value={form.visitorGuidance.publicGuidance} onChange={(event) => updateField('visitorGuidance.publicGuidance', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Extended Contact Controls</h3>
            <p className="text-sm text-sidebar-foreground/60">Add office hours, visiting notes, emergency details, and role-based public contact pointers.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sidebar-foreground/70">Office Hours</Label>
              <Input value={form.contact.officeHours} onChange={(event) => updateField('contact.officeHours', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Visiting Notes</Label>
              <Input value={form.contact.visitingNotes} onChange={(event) => updateField('contact.visitingNotes', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Emergency Label</Label>
              <Input value={form.contact.emergencyLabel} onChange={(event) => updateField('contact.emergencyLabel', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground/70">Emergency Phone</Label>
              <Input value={form.contact.emergencyPhone} onChange={(event) => updateField('contact.emergencyPhone', event.target.value)} className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-sidebar-foreground/70">Role-based Contact Entries</p>
            {normalizeList(form.contact.contactRoles).map((item, index) => (
              <div key={`contact-role-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input value={item.label || ''} onChange={(event) => updateField(`contact.contactRoles.${index}.label`, event.target.value)} placeholder="Label" className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Input value={item.value || ''} onChange={(event) => updateField(`contact.contactRoles.${index}.value`, event.target.value)} placeholder="Value" className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('contact.contactRoles', normalizeList(form.contact.contactRoles).filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('contact.contactRoles', [...normalizeList(form.contact.contactRoles), { label: '', value: '' }])}>
              Add Contact Entry
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-4">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Footer Quick Links & Social Links</h3>
            <p className="text-sm text-sidebar-foreground/60">Manage additional footer links for public navigation and community platforms.</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-sidebar-foreground/70">Quick Links</p>
            {normalizeList(form.footer.quickLinks).map((item, index) => (
              <div key={`quick-link-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input value={item.label || ''} onChange={(event) => updateField(`footer.quickLinks.${index}.label`, event.target.value)} placeholder="Link Label" className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Input value={item.path || ''} onChange={(event) => updateField(`footer.quickLinks.${index}.path`, event.target.value)} placeholder="/route" className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('footer.quickLinks', normalizeList(form.footer.quickLinks).filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('footer.quickLinks', [...normalizeList(form.footer.quickLinks), { label: '', path: '' }])}>
              Add Quick Link
            </Button>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-sidebar-foreground/70">Social / Community Links</p>
            {normalizeList(form.footer.socialLinks).map((item, index) => (
              <div key={`social-link-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input value={item.label || ''} onChange={(event) => updateField(`footer.socialLinks.${index}.label`, event.target.value)} placeholder="Label" className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Input value={item.url || ''} onChange={(event) => updateField(`footer.socialLinks.${index}.url`, event.target.value)} placeholder="https://..." className="bg-sidebar border-sidebar-border text-sidebar-foreground" />
                <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('footer.socialLinks', normalizeList(form.footer.socialLinks).filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="border-sidebar-border text-sidebar-foreground" onClick={() => updateField('footer.socialLinks', [...normalizeList(form.footer.socialLinks), { label: '', url: '' }])}>
              Add Social Link
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-sidebar-border bg-sidebar-accent p-6 space-y-6">
          <div>
            <h3 className="font-display text-xl text-sidebar-foreground">Shared Public Page Heroes</h3>
            <p className="text-sm text-sidebar-foreground/60">Edit the heading text for each public page here. Hero images are now managed from the Hero Banners page.</p>
          </div>
          {PAGE_FIELDS.map((page, index) => (
            <div key={page.key} className="space-y-4">
              {index > 0 && <Separator className="bg-sidebar-border" />}
              <div>
                <h4 className="text-lg font-medium text-sidebar-foreground">{page.label}</h4>
                <p className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/45 mt-1">{page.key}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sidebar-foreground/70">Label</Label>
                  <Input
                    value={form.pages[page.key].label}
                    onChange={(event) => updateField(`pages.${page.key}.label`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div>
                  <Label className="text-sidebar-foreground/70">Label (Twi)</Label>
                  <Input
                    value={form.pages[page.key].label_twi || ''}
                    onChange={(event) => updateField(`pages.${page.key}.label_twi`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <BilingualFieldHelper sourceValue={form.pages[page.key].label} targetValue={form.pages[page.key].label_twi} onUseDraft={() => updateField(`pages.${page.key}.label_twi`, form.pages[page.key].label)} onClear={() => updateField(`pages.${page.key}.label_twi`, '')} />
                </div>
                <div>
                  <Label className="text-sidebar-foreground/70">Title</Label>
                  <Input
                    value={form.pages[page.key].title}
                    onChange={(event) => updateField(`pages.${page.key}.title`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div>
                  <Label className="text-sidebar-foreground/70">Title (Twi)</Label>
                  <Input
                    value={form.pages[page.key].title_twi || ''}
                    onChange={(event) => updateField(`pages.${page.key}.title_twi`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <BilingualFieldHelper sourceValue={form.pages[page.key].title} targetValue={form.pages[page.key].title_twi} onUseDraft={() => updateField(`pages.${page.key}.title_twi`, form.pages[page.key].title)} onClear={() => updateField(`pages.${page.key}.title_twi`, '')} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sidebar-foreground/70">Description</Label>
                  <Textarea
                    rows={3}
                    value={form.pages[page.key].description}
                    onChange={(event) => updateField(`pages.${page.key}.description`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sidebar-foreground/70">Description (Twi)</Label>
                  <Textarea
                    rows={3}
                    value={form.pages[page.key].description_twi || ''}
                    onChange={(event) => updateField(`pages.${page.key}.description_twi`, event.target.value)}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <BilingualFieldHelper sourceValue={form.pages[page.key].description} targetValue={form.pages[page.key].description_twi} onUseDraft={() => updateField(`pages.${page.key}.description_twi`, form.pages[page.key].description)} onClear={() => updateField(`pages.${page.key}.description_twi`, '')} />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
