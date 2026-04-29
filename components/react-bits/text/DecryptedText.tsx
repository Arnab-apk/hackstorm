'use client';

import { useEffect, useRef, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
  revealDirection?: 'start' | 'end' | 'center';
  onAnimationComplete?: () => void;
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  revealDirection = 'start',
  onAnimationComplete,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const iterationRef = useRef(0);

  const getRandomChar = () => characters[Math.floor(Math.random() * characters.length)];

  const animate = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterationRef.current = 0;

    const interval = setInterval(() => {
      iterationRef.current += 1;
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            const revealThreshold =
              revealDirection === 'start'
                ? index
                : revealDirection === 'end'
                  ? text.length - 1 - index
                  : Math.abs(Math.floor(text.length / 2) - index);
            if (iterationRef.current > revealThreshold * (maxIterations / text.length) + maxIterations / 3) {
              return char;
            }
            return getRandomChar();
          })
          .join('')
      );

      if (iterationRef.current >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
        setHasAnimated(true);
        onAnimationComplete?.();
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn !== 'view' || hasAnimated) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateOn, hasAnimated]);

  return (
    <span
      ref={ref}
      className={parentClassName}
      onMouseEnter={animateOn === 'hover' ? animate : undefined}
    >
      {displayText.split('').map((char, index) => {
        const isRevealed = char === text[index];
        return (
          <span key={index} className={isRevealed ? className : `${className} ${encryptedClassName}`}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
