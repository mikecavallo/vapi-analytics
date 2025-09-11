import { useEffect, useRef } from 'react';

interface PlasmaBackgroundProps {
  className?: string;
}

export function PlasmaBackground({ className = '' }: PlasmaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let time = 0;

    const animate = () => {
      const { width, height } = canvas;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Create plasma effect
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
          // Plasma mathematics
          const value = Math.sin(x * 0.01 + time) +
                       Math.sin(y * 0.01 + time) +
                       Math.sin((x + y) * 0.01 + time) +
                       Math.sin(Math.sqrt(x * x + y * y) * 0.01 + time);

          // Normalize value to 0-1
          const normalizedValue = (value + 4) / 8;

          // Create color based on plasma value
          const hue = (normalizedValue * 360 + time * 50) % 360;
          const saturation = 70;
          const lightness = 30 + normalizedValue * 20;

          // Convert HSL to RGB
          const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
          const x1 = c * (1 - Math.abs((hue / 60) % 2 - 1));
          const m = lightness / 100 - c / 2;

          let r = 0, g = 0, b = 0;
          if (hue >= 0 && hue < 60) {
            r = c; g = x1; b = 0;
          } else if (hue >= 60 && hue < 120) {
            r = x1; g = c; b = 0;
          } else if (hue >= 120 && hue < 180) {
            r = 0; g = c; b = x1;
          } else if (hue >= 180 && hue < 240) {
            r = 0; g = x1; b = c;
          } else if (hue >= 240 && hue < 300) {
            r = x1; g = 0; b = c;
          } else if (hue >= 300 && hue < 360) {
            r = c; g = 0; b = x1;
          }

          // Convert to 0-255 range
          r = Math.round((r + m) * 255);
          g = Math.round((g + m) * 255);
          b = Math.round((b + m) * 255);

          // Apply to multiple pixels for performance
          for (let dx = 0; dx < 2 && x + dx < width; dx++) {
            for (let dy = 0; dy < 2 && y + dy < height; dy++) {
              const index = ((y + dy) * width + (x + dx)) * 4;
              data[index] = r;       // Red
              data[index + 1] = g;   // Green
              data[index + 2] = b;   // Blue
              data[index + 3] = 100; // Alpha (semi-transparent)
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add overlay gradients for depth
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)'); // Blue center
      gradient.addColorStop(0.7, 'rgba(147, 51, 234, 0.05)'); // Purple edge
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)'); // Dark edge

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ filter: 'blur(1px)', opacity: 0.6 }}
    />
  );
}