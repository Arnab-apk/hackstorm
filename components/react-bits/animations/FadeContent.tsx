'use client';

import { motion, useInView } from 'motion/react';
import { useRef, ReactNode } from 'react';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  threshold?: number;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 0.6,
  delay = 0,
  className = '',
  threshold = 0.1,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        filter: blur ? 'blur(10px)' : 'blur(0px)',
      }}
      animate={
        isInView
          ? { opacity: 1, filter: 'blur(0px)' }
          : { opacity: 0, filter: blur ? 'blur(10px)' : 'blur(0px)' }
      }
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
