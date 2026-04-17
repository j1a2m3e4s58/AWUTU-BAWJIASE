import { useEffect } from 'react';

export function usePreloadImages(urls, limit = 8) {
  const preloadKey = (urls || []).filter(Boolean).slice(0, limit).join('|');

  useEffect(() => {
    const uniqueUrls = [...new Set(preloadKey.split('|').filter(Boolean))];
    const preloadedImages = uniqueUrls.map((url) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [preloadKey]);
}
