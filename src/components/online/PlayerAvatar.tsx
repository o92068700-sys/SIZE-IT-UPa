import { playerColor } from '@/lib/playerColor';

const SIZES = {
  sm: { box: 28, text: 10 },
  md: { box: 40, text: 13 },
  lg: { box: 56, text: 18 },
  xl: { box: 88, text: 28 },
} as const;

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

interface PlayerAvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  muted?: boolean;
  className?: string;
}

export default function PlayerAvatar({ name, size = 'md', muted = false, className = '' }: PlayerAvatarProps) {
  const dimensions = SIZES[size];
  const color = playerColor(name);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-display font-extrabold uppercase tracking-wide ${
        muted ? 'opacity-45' : ''
      } ${className}`}
      style={{
        width: dimensions.box,
        height: dimensions.box,
        fontSize: dimensions.text,
        color,
        borderColor: `${color}66`,
        backgroundColor: `${color}1f`,
      }}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </span>
  );
}
