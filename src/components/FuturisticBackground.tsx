'use client';

import { useEffect, useRef } from 'react';

export default function FuturisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let time = 0;
    const noiseData = new Uint8Array(canvas.width * canvas.height);
    
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 255;
    }

    const animate = () => {
      time += 0.001;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated gradients
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time) * 100,
        canvas.height * 0.4 + Math.cos(time * 0.8) * 80,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(34, 197, 94, 0.15)');
      gradient1.addColorStop(0.5, 'rgba(234, 179, 8, 0.08)');
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6 + Math.sin(time * 1.2) * 60,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(249, 115, 22, 0.12)');
      gradient2.addColorStop(0.6, 'rgba(234, 179, 8, 0.06)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Halftone circle
      const circleX = canvas.width * 0.75;
      const circleY = canvas.height * 0.5;
      const circleRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const pulse = Math.sin(time * 2) * 0.05 + 1;

      for (let i = 0; i < 800; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * circleRadius;
        const x = circleX + Math.cos(angle) * distance;
        const y = circleY + Math.sin(angle) * distance;
        const distFromCenter = distance / circleRadius;
        const size = (1 - distFromCenter) * 3 * pulse;
        const alpha = (1 - distFromCenter) * 0.6;

        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animated noise
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noiseIndex = (i / 4 + Math.floor(time * 1000)) % noiseData.length;
        const noise = noiseData[noiseIndex] * 0.08;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      
      ctx.putImageData(imageData, 0, 0);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
      />
      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 pointer-events-none" />
    </>
  );
}
