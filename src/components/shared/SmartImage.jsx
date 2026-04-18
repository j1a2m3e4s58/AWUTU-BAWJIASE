import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SmartImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackLabel = 'Image unavailable',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  sizes,
  onClick,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-muted ${wrapperClassName}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-card/80 to-muted" />
      )}

      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          onClick={onClick}
          className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-background/85 via-card/85 to-background/90 p-4 text-center text-muted-foreground">
          <ImageOff className="h-8 w-8 text-primary/55" />
          <p className="text-xs uppercase tracking-[0.16em]">{fallbackLabel}</p>
        </div>
      )}
    </div>
  );
}
