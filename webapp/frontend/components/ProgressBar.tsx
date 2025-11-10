'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-light tracking-wide text-gray-600">{label}</span>
          {showPercentage && (
            <span className="text-xs font-light tracking-wide text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="h-px w-full bg-gray-200">
        <div
          className="h-full bg-gray-900 transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

