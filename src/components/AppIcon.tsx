import React, { useState } from 'react';

interface AppIconProps {
  name: 'logo' | 'home' | 'explore' | 'likes' | 'dashboard' | 'settings';
  className?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  className = "w-5 h-5",
  alt = "icon",
  fallback,
  size = 20
}) => {
  // Yalnızca gerçekten var olan dosyalar denenir (gereksiz 404 isteği yok); BASE_URL sayesinde
  // uygulama kök dizinde de alt dizinde de (ör. GitHub Pages) doğru çalışır.
  const base = import.meta.env.BASE_URL;
  // 'dashboard' (Seyir) için dosya yok; doğrudan satır içi yedek ikon kullanılır (404 isteği atılmaz).
  const hasFile = name !== 'dashboard';
  const candidates = name === 'logo'
    ? [`${base}assets/logo.webp`, `${base}assets/logo.png`]
    : [`${base}assets/${name}.svg`];

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(!hasFile);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={alt}
      width={size}
      height={size}
      loading={name === 'logo' ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
      className={`object-contain transition-opacity duration-200 select-none pointer-events-none ${className}`}
    />
  );
};
