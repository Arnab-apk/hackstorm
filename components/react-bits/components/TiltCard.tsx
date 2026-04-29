'use client';

import { useRef, useState, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnable?: boolean;
  glareColor?: string;
  borderGlow?: boolean;
  borderColor?: string;
}

export default function TiltCard({
  children,
  className = '',
  tiltAmount = 10,
  glareEnable = true,
  glareColor = 'rgba(20, 184, 166, 0.15)',
  borderGlow = false,
  borderColor = 'hsl(166, 73%, 44%)',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTransform({
      rotateX: (0.5 - y) * tiltAmount,
      rotateY: (x - 0.5) * tiltAmount,
    });
    setGlare({ x: x * 100, y: y * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 ${className}`}
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
          boxShadow: borderGlow && glare.opacity
            ? `0 0 20px -5px ${borderColor}40, inset 0 0 20px -10px ${borderColor}20`
            : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {glareEnable && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glareColor}, transparent 50%)`,
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
