import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface GooeyNavProps {
  items: NavItem[];
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function GooeyNav({ 
  items, 
  className = '', 
  activeColor = 'rgba(59, 130, 246, 0.8)',
  inactiveColor = 'rgba(75, 85, 99, 0.1)'
}: GooeyNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateIndicator(activeIndex);
  }, [activeIndex]);

  const updateIndicator = (index: number) => {
    if (navRef.current) {
      const links = navRef.current.querySelectorAll('a');
      const activeItem = links[index];
      
      if (activeItem) {
        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        setIndicatorStyle({
          width: itemRect.width + 16,
          height: itemRect.height + 8,
          transform: `translateX(${itemRect.left - navRect.left - 8}px)`,
          opacity: 1,
        });
      }
    }
  };

  return (
    <div className={`relative gooey-nav ${className}`} style={{ filter: 'url(#goo)' }}>
      <div 
        ref={navRef}
        className="relative flex items-center space-x-1 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-full px-2 py-2 border border-white/20 dark:border-gray-700/30"
      >
        {/* Gooey Background Indicator */}
        <div
          className="absolute rounded-full transition-all duration-300 ease-out"
          style={{
            ...indicatorStyle,
            filter: 'blur(1px)',
            background: `linear-gradient(45deg, ${activeColor}, rgba(8, 145, 178, 0.6))`,
          }}
        />
        
        {/* Navigation Items */}
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeIndex === index 
                ? 'text-white font-semibold' 
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
            onClick={() => {
              setActiveIndex(index);
              updateIndicator(index);
            }}
          >
            <div className="flex items-center space-x-2">
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Gooey Effect with CSS */}
      <style>{`
        .gooey-nav {
          filter: url('#goo');
        }
        
        @keyframes gooey-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .gooey-nav:hover {
          animation: gooey-pop 0.3s ease;
        }
      `}</style>

      {/* SVG Filter for Gooey Effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}