'use client';

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
  className?: string;
}

export default function GradientText({
  children,
  from = '#14b8a6',
  via = '#67e8f9',
  to = '#f59e0b',
  animate = true,
  className = '',
}: GradientTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${animate ? 'animate-gradient-x' : ''} ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`,
        backgroundSize: animate ? '200% auto' : '100% auto',
      }}
    >
      {children}
    </span>
  );
}
