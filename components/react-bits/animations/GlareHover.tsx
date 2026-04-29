'use client';

import { useRef, ReactNode, useState } from 'react';

interface GlareHoverProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
}

export default function GlareHover({
  children,
  className = '',
  glareColor = 'rgba(20, 184, 166, 0.08)',
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x, y });
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor}, transparent 50%)`,
        }}
      />
    </div>
  );
}
