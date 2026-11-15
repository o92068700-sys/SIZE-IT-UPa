import { useLanguage } from '@/i18n/LanguageProvider';

interface TimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
  label?: string;
}

export default function TimerRing({ secondsLeft, totalSeconds, size = 68, label }: TimerRingProps) {
  const { t } = useLanguage();
  const safeTotal = Math.max(1, totalSeconds);
  const ratio = Math.max(0, Math.min(1, secondsLeft / safeTotal));
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = secondsLeft <= 5 ? '#FF3D3D' : secondsLeft <= 10 ? '#F5B942' : '#5B8CFF';
  const display = Math.max(0, Math.ceil(secondsLeft));

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={label ?? t('onlineTimerLabel')}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#332A4D"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset,stroke] duration-200 ease-linear"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-extrabold tabular-nums"
        style={{ color, fontSize: size * 0.3 }}
      >
        {display}
      </span>
    </div>
  );
}
