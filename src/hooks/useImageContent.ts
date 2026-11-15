import { useEffect, useState } from 'react';
import {
  measureOpaqueBounds,
  type ImageContentFrame,
} from '@/lib/imageContent';

type CacheEntry =
  | { status: 'missing' }
  | { status: 'ready'; frame: ImageContentFrame };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

function loadFrame(src: string): Promise<CacheEntry> {
  const cached = cache.get(src);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(src);
  if (pending) return pending;

  const request = new Promise<CacheEntry>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    // Remote silhouettes (world maps) are measured by reading canvas pixels.
    // GitHub's raw host sends `Access-Control-Allow-Origin: *`, so requesting
    // CORS keeps the canvas untainted. Local assets stay same-origin.
    if (/^https?:\/\//i.test(src)) image.crossOrigin = 'anonymous';
    image.onload = () => {
      const entry: CacheEntry = { status: 'ready', frame: measureOpaqueBounds(image) };
      cache.set(src, entry);
      inflight.delete(src);
      resolve(entry);
    };
    image.onerror = () => {
      const entry: CacheEntry = { status: 'missing' };
      cache.set(src, entry);
      inflight.delete(src);
      resolve(entry);
    };
    image.src = src;
  });

  inflight.set(src, request);
  return request;
}

export function useImageContent(src: string) {
  const [entry, setEntry] = useState<CacheEntry | null>(() => cache.get(src) ?? null);

  useEffect(() => {
    let cancelled = false;
    const cached = cache.get(src);
    if (cached) {
      setEntry(cached);
      return;
    }
    setEntry(null);
    void loadFrame(src).then((result) => {
      if (!cancelled) setEntry(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return {
    missing: entry?.status === 'missing',
    available: entry?.status === 'ready',
    frame: entry?.status === 'ready' ? entry.frame : null,
  };
}
