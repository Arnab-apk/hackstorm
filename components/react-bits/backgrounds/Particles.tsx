'use client';

import { useEffect, useRef, useState } from 'react';

interface ParticlesProps {
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  connectDistance?: number;
  className?: string;
}

export default function Particles({
  count = 50,
  color = '20, 184, 166',
  maxSize = 2,
  speed = 0.3,
  connectDistance = 120,
  className = '',
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      s: Math.random() * maxSize + 0.5,
      a: Math.random() * 0.5 + 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of dots) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { p.x += dx * 0.02; p.y += dy * 0.02; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.a})`;
        ctx.fill();
      }
      if (connectDistance > 0) {
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < connectDistance) {
              ctx.beginPath();
              ctx.moveTo(dots[i].x, dots[i].y);
              ctx.lineTo(dots[j].x, dots[j].y);
              ctx.strokeStyle = `rgba(${color}, ${(1 - d / connectDistance) * 0.15})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [isMobile, count, color, maxSize, speed, connectDistance]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
