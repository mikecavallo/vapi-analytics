import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  animationType?: 'fadeInUp' | 'fadeIn' | 'slideInLeft' | 'bounceIn';
  triggerOnMount?: boolean;
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  animationType = 'fadeInUp',
  triggerOnMount = true
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !triggerOnMount) return;

    const chars = containerRef.current.children;
    
    // Set initial states based on animation type
    const getInitialState = () => {
      switch (animationType) {
        case 'fadeInUp':
          return { y: 100, opacity: 0 };
        case 'fadeIn':
          return { opacity: 0 };
        case 'slideInLeft':
          return { x: -50, opacity: 0 };
        case 'bounceIn':
          return { scale: 0, opacity: 0 };
        default:
          return { y: 100, opacity: 0 };
      }
    };

    const getFinalState = () => {
      switch (animationType) {
        case 'fadeInUp':
          return { y: 0, opacity: 1 };
        case 'fadeIn':
          return { opacity: 1 };
        case 'slideInLeft':
          return { x: 0, opacity: 1 };
        case 'bounceIn':
          return { scale: 1, opacity: 1 };
        default:
          return { y: 0, opacity: 1 };
      }
    };

    const getEasing = () => {
      switch (animationType) {
        case 'bounceIn':
          return 'back.out(1.7)';
        case 'slideInLeft':
          return 'power2.out';
        default:
          return 'power2.out';
      }
    };

    // Set initial state
    gsap.set(chars, getInitialState());

    // Animate to final state
    gsap.to(chars, {
      ...getFinalState(),
      duration,
      stagger,
      delay,
      ease: getEasing(),
    });

  }, [delay, duration, stagger, animationType, triggerOnMount]);

  const renderChars = () => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        style={{ 
          display: 'inline-block',
          whiteSpace: char === ' ' ? 'pre' : 'normal'
        }}
        aria-hidden="true"
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label={text}
      role="text"
    >
      {renderChars()}
    </div>
  );
}