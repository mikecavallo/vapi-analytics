import { useRef, useEffect } from 'react';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  className?: string;
}

export default function Orb({ 
  hue = 0, 
  hoverIntensity = 1.41, 
  rotateOnHover = true, 
  forceHoverState = false,
  className = "" 
}: OrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    const handleMouseEnter = () => {
      isHovered.current = true;
      if (rotateOnHover) {
        orb.style.transform = `rotate(${hoverIntensity * 90}deg) scale(${1 + hoverIntensity * 0.1})`;
      }
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      if (rotateOnHover) {
        orb.style.transform = 'rotate(0deg) scale(1)';
      }
    };

    orb.addEventListener('mouseenter', handleMouseEnter);
    orb.addEventListener('mouseleave', handleMouseLeave);

    // Apply force hover state if needed
    if (forceHoverState) {
      handleMouseEnter();
    }

    return () => {
      orb.removeEventListener('mouseenter', handleMouseEnter);
      orb.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <div 
      ref={orbRef}
      className={`orb-background ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, hsl(${hue}, 70%, 50%) 0%, hsl(${hue}, 60%, 30%) 30%, hsl(${hue}, 40%, 10%) 70%, transparent 100%)`,
        opacity: 0.6,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'auto',
        zIndex: -1,
      }}
    />
  );
}