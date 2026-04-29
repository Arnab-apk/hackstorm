'use client';

import { useRef, ReactNode, useCallback } from 'react';

interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkSize?: number;
  duration?: number;
}

export default function ClickSpark({
  children,
  sparkColor = 'hsl(166, 73%, 44%)',
  sparkCount = 8,
  sparkSize = 10,
  duration = 400,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const createSpark = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        const angle = (360 / sparkCount) * i;
        const distance = 20 + Math.random() * 30;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;

        Object.assign(spark.style, {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${sparkSize}px`,
          height: `${sparkSize}px`,
          borderRadius: '50%',
          backgroundColor: sparkColor,
          pointerEvents: 'none',
          zIndex: '9999',
          transform: 'translate(-50%, -50%)',
          transition: `all ${duration}ms ease-out`,
          opacity: '1',
        });

        container.appendChild(spark);

        requestAnimationFrame(() => {
          spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
          spark.style.opacity = '0';
        });

        setTimeout(() => spark.remove(), duration);
      }
    },
    [sparkColor, sparkCount, sparkSize, duration]
  );

  return (
    <div ref={containerRef} className="relative inline-block" onClick={createSpark}>
      {children}
    </div>
  );
}
