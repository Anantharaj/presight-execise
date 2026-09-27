import { useState } from 'react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-12 text-sm',
  lg: 'size-16 text-base',
} as const;

const pixels = { sm: 32, md: 48, lg: 64 } as const;

export interface AvatarProps {
  src?: string;
  /** Full name; used for alt text and the initials fallback. */
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}

/** Lazy-loaded avatar image that falls back to initials if the image fails. */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src && failedSrc !== src;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          width={pixels[size]}
          height={pixels[size]}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-label={name} role="img">
          {initials(...name.split(' ').slice(0, 2))}
        </span>
      )}
    </span>
  );
}
