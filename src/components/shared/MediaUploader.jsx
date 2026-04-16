import React, { useState, useRef } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { Upload, Link2, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * MediaUploader
 * Props:
 *  - value: current URL string
 *  - onChange(url): called when URL changes
 *  - accept: e.g. "image/*" or "video/*"
 *  - label: optional label shown above tabs
 *  - mediaType: "image" | "video"
 */
export default function MediaUploader({ value, onChange, accept = 'image/*', label, mediaType = 'image' }) {
  const [tab, setTab] = useState('url'); // 'url' | 'device' | 'gdrive'
  const [uploading, setUploading] = useState(false);
  const [driveInput, setDriveInput] = useState('');
  const fileRef = useRef();

  const tabs = [
    { id: 'url', label: mediaType === 'video' ? 'Video URL' : mediaType === 'file' ? 'File URL' : 'Image URL', icon: Link2 },
    { id: 'device', label: 'Upload from Device', icon: HardDrive },
    ...(mediaType === 'file' ? [] : [{ id: 'gdrive', label: 'Google Drive', icon: Upload }]),
  ];

  // Convert Google Drive share link to direct embed/download URL
  const convertDriveLink = (input) => {
    // Format: https://drive.google.com/file/d/FILE_ID/view?...
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      if (mediaType === 'video') {
        // Use Google Drive preview embed URL for videos
        return `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (mediaType === 'file') {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      } else {
        // Use direct download URL for images
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    // Also handle: https://drive.google.com/open?id=FILE_ID
    const match2 = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) {
      const fileId = match2[1];
      if (mediaType === 'video') {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (mediaType === 'file') {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      } else {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return input;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await firebaseApi.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  const handleDrive = () => {
    if (!driveInput.trim()) return;
    const converted = convertDriveLink(driveInput.trim());
    onChange(converted);
  };

  return (
    <div className="space-y-3 border border-sidebar-border bg-sidebar-accent p-4 text-sidebar-foreground">
      {label && <p className="text-sm font-medium text-sidebar-foreground">{label}</p>}

      {/* Tab switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 overflow-hidden border border-sidebar-border bg-sidebar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-sidebar text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* URL input */}
      {tab === 'url' && (
        <Input
          placeholder={
            mediaType === 'video'
              ? 'https://example.com/video.mp4'
              : mediaType === 'file'
                ? 'https://example.com/file.pdf'
                : 'https://example.com/image.jpg'
          }
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/45"
        />
      )}

      {/* Device upload */}
      {tab === 'device' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => fileRef.current.click()}
            disabled={uploading}
          >
            <HardDrive className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
          {value && !uploading && (
            <p className="text-xs text-green-600 mt-1 truncate">✓ Uploaded: {value.split('/').pop()}</p>
          )}
        </div>
      )}

      {/* Google Drive */}
      {tab === 'gdrive' && (
        <div className="space-y-2">
          <Input
            placeholder="Paste Google Drive share link..."
            value={driveInput}
            onChange={(e) => setDriveInput(e.target.value)}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/45"
          />
          <Button type="button" variant="outline" className="w-full bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleDrive}>
            <Upload className="w-4 h-4 mr-2" />
            Use Drive Link
          </Button>
          <p className="text-xs text-sidebar-foreground/60">
            Share your file via Google Drive → Share → "Anyone with the link" → paste link above.
          </p>
          {value && value.includes('drive.google.com') && (
            <p className="text-xs text-green-600 truncate">✓ Drive link applied</p>
          )}
        </div>
      )}

      {/* Preview */}
      {value && tab !== 'device' && mediaType === 'image' && (
        <div className="mt-2 overflow-hidden border border-sidebar-border w-full aspect-video bg-sidebar">
          <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}

      {value && mediaType === 'file' && (
        <p className="text-xs text-green-600 break-all">Attached file: {value}</p>
      )}
    </div>
  );
}
