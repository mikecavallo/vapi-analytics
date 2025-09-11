import { useEffect, useRef } from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
  shimmerDuration?: number;
  shimmerDelay?: number;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  className = '',
  shimmerWidth = 100,
  shimmerDuration = 2.5,
  shimmerDelay = 0,
  shimmerColor = 'rgba(255, 255, 255, 0.6)'
}: ShinyTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const element = textRef.current;
    
    // Create CSS animation keyframes dynamically
    const shimmerKeyframes = `
      @keyframes shimmer-${Math.random().toString(36).substr(2, 9)} {
        0% {
          background-position: -${shimmerWidth}px 0;
        }
        100% {
          background-position: calc(100% + ${shimmerWidth}px) 0;
        }
      }
    `;

    // Add the keyframes to the document
    const style = document.createElement('style');
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);

    // Apply the shimmer effect
    const animationName = shimmerKeyframes.match(/@keyframes\s+([^\s{]+)/)?.[1];
    if (animationName) {
      element.style.background = `linear-gradient(
        90deg,
        transparent,
        ${shimmerColor},
        transparent
      )`;
      element.style.backgroundSize = `${shimmerWidth}px 100%`;
      element.style.backgroundRepeat = 'no-repeat';
      element.style.backgroundPosition = `-${shimmerWidth}px 0`;
      element.style.backgroundClip = 'text';
      (element.style as any).webkitBackgroundClip = 'text';
      element.style.animation = `${animationName} ${shimmerDuration}s infinite ${shimmerDelay}s`;
    }

    return () => {
      document.head.removeChild(style);
    };
  }, [shimmerWidth, shimmerDuration, shimmerDelay, shimmerColor]);

  return (
    <span
      ref={textRef}
      className={`inline-block ${className}`}
      style={{
        background: `linear-gradient(
          90deg,
          currentColor,
          currentColor
        )`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
      }}
    >
      {text}
    </span>
  );
}