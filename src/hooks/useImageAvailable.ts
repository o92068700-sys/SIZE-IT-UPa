import { useEffect, useState } from 'react';

export function useImageAvailable(src: string) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAvailable(null);
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setAvailable(true);
    };
    image.onerror = () => {
      if (!cancelled) setAvailable(false);
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return available;
}
