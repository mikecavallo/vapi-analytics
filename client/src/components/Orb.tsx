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
        orb.style.transform = `translate(-50%, -50%) rotate(${hoverIntensity * 90}deg) scale(${1 + hoverIntensity * 0.1})`;
      }
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      if (rotateOnHover) {
        orb.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
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
        top: '50%',
        left: '50%',
        width: '800px',
        height: '800px',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle at center, hsl(${hue}, 80%, 60%) 0%, hsl(${hue}, 70%, 40%) 20%, hsl(${hue}, 60%, 20%) 40%, hsl(${hue + 20}, 50%, 15%) 60%, transparent 100%)`,
        borderRadius: '50%',
        opacity: 0.7,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'auto',
        zIndex: 1,
        filter: 'blur(2px)',
      }}
    />
  );
}