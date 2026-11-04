import React from 'react';

/** Abstract işareti: üst üste duran iki makale kartı. */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="6" y="9" width="26" height="32" rx="8" transform="rotate(-12 19 25)" className="fill-t1 stroke-edge" strokeWidth="2" />
    <rect x="15" y="5" width="26" height="32" rx="8" transform="rotate(9 28 21)" className="fill-accent stroke-edge" strokeWidth="2" />
    <path d="M24 21h12M24 27h8" transform="rotate(9 28 21)" className="stroke-accent-ink" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
