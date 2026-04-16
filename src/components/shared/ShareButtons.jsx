import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ title, text, url }) {
  const shareUrl = url || window.location.href;
  const shareText = text || title || document.title;

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, text: shareText, url: shareUrl });
    } else {
      copy();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Share</span>
      <button
        onClick={whatsapp}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-600 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </button>
      <button
        onClick={nativeShare}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}