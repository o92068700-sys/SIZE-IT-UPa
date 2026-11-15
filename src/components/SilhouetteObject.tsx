import { useImageContent } from '@/hooks/useImageContent';
import type { ImageContentFrame } from '@/lib/imageContent';

interface SilhouetteObjectProps {
  src: string;
  name: string;
  color: string;
  frame?: ImageContentFrame | null;
}

export default function SilhouetteObject({ src, name, color, frame }: SilhouetteObjectProps) {
  const measured = useImageContent(src);
  const content = frame ?? measured.frame;
  const missing = !content && measured.missing;

  if (missing) {
    return (
      <div
        role="img"
        aria-label={name}
        className="pointer-events-none h-full w-full rounded-md"
        style={{ border: `2px dashed ${color}`, backgroundColor: `${color}22` }}
      />
    );
  }

  const mask = `url("${src}")`;
  const crop = content && content.width > 0 && content.height > 0;

  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden" role="img" aria-label={name}>
      <div
        className="absolute transition-colors duration-700"
        style={{
          backgroundColor: color,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: crop ? '0 0' : 'bottom center',
          maskPosition: crop ? '0 0' : 'bottom center',
          WebkitMaskSize: crop ? '100% 100%' : 'contain',
          maskSize: crop ? '100% 100%' : 'contain',
          ...(crop
            ? {
                left: `${(-content.x / content.width) * 100}%`,
                top: `${(-content.y / content.height) * 100}%`,
                width: `${(content.imageWidth / content.width) * 100}%`,
                height: `${(content.imageHeight / content.height) * 100}%`,
              }
            : { inset: 0 }),
        }}
      />
    </div>
  );
}
