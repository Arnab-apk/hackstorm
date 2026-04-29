'use client';

import { motion, useInView } from 'motion/react';
import { useRef, ReactNode } from 'react';

interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  delay?: number;
  className?: string;
  threshold?: number;
}

export default function AnimatedContent({
  children,
  distance = 50,
  direction = 'vertical',
  delay = 0,
  className = '',
  threshold = 0.1,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const initial = {
    opacity: 0,
    ...(direction === 'vertical' ? { y: distance } : { x: distance }),
  };

  const animate = isInView
    ? { opacity: 1, y: 0, x: 0 }
    : initial;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
