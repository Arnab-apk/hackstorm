'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'motion/react';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
}

export default function Magnet({
  children,
  padding = 60,
  disabled = false,
  magnetStrength = 0.3,
  className = '',
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setPosition({
      x: (e.clientX - centerX) * magnetStrength,
      y: (e.clientY - centerY) * magnetStrength,
    });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ padding }}
    >
      {children}
    </motion.div>
  );
}
