'use client';

import { useEffect, useRef, useState } from 'react';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
}

export default function Aurora({
  colorStops = ['#0d9488', '#14b8a6', '#f59e0b'],
  amplitude = 1.0,
  blend = 0.5,
  speed = 0.5,
  className = '',
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      time += 0.005 * speed;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      colorStops.forEach((color, i) => {
        const offset = (i / colorStops.length) * Math.PI * 2;
        const x = width * (0.3 + 0.4 * Math.sin(time + offset));
        const y = height * (0.3 + 0.4 * Math.cos(time * 0.7 + offset));
        const radius = Math.max(width, height) * (0.3 + 0.15 * Math.sin(time * 0.5 + i)) * amplitude;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color + 'cc');
        gradient.addColorStop(0.5, color + '44');
        gradient.addColorStop(1, color + '00');

        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = blend;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [colorStops, amplitude, blend, speed, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
