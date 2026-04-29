'use client';

import { useRef, ReactNode, JSX } from 'react';

interface StarBorderProps {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  color?: string;
  speed?: string;
  children: ReactNode;
}

export default function StarBorder({
  as: Component = 'div',
  className = '',
  color = 'hsl(166, 73%, 44%)',
  speed = '6s',
  children,
  ...rest
}: StarBorderProps & Record<string, unknown>) {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl ${className}`}
      style={{ padding: '1px 0' }}
      {...rest}
    >
      <div
        className="absolute h-[100px] w-[100px] bottom-[-11px] right-[-10px] animate-star-movement-bottom z-[1] opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute h-[100px] w-[100px] top-[-10px] left-[-10px] animate-star-movement-top z-[1] opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-[2] rounded-xl border border-border bg-card">
        {children}
      </div>
    </Component>
  );
}
