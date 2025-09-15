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
      className={`orb-container ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '500px',
        height: '500px',
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'auto',
        zIndex: 1,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, transparent 70%, hsl(${hue}, 100%, 50%) 75%, transparent 80%)`,
          filter: 'blur(20px)',
          opacity: 0.8,
        }}
      />
      
      {/* Middle glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '90%',
          height: '90%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, transparent 75%, hsl(${hue}, 100%, 60%) 80%, transparent 85%)`,
          filter: 'blur(10px)',
          opacity: 0.9,
        }}
      />
      
      {/* Inner bright ring */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '85%',
          height: '85%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `2px solid hsl(${hue}, 100%, 70%)`,
          boxShadow: `0 0 20px hsl(${hue}, 100%, 50%), inset 0 0 20px hsl(${hue}, 100%, 50%)`,
          opacity: 0.7,
        }}
      />
    </div>
  );
}