'use client';

import { useState, useCallback, ReactNode } from 'react';

interface RippleItem {
  x: number;
  y: number;
  id: number;
}

interface RippleProps {
  children: ReactNode;
  color?: string;
  duration?: number;
  className?: string;
}

export default function Ripple({
  children,
  color = 'rgba(20, 184, 166, 0.3)',
  duration = 600,
  className = '',
}: RippleProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, duration);
    },
    [duration]
  );

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute animate-ripple rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
