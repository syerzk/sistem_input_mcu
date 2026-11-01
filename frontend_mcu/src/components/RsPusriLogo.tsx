import React from 'react';

interface RsPusriLogoProps {
  className?: string;
  variant?: 'color' | 'white' | 'badge';
  showBorders?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const RsPusriLogo: React.FC<RsPusriLogoProps> = ({
  className = '',
  variant = 'color',
  showBorders = true,
  size = 'md'
}) => {
  const isWhite = variant === 'white';
  
  // Sizing helpers
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    full: 'w-full'
  }[size];

  const lineColor = isWhite ? '#94a3b8' : '#0c2b48';
  const subtextColor = isWhite ? '#93c5fd' : '#1e5162';
  const mainTextColor = isWhite ? '#ffffff' : '#0a2540';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 96"
        className={`${sizeClasses} w-auto max-w-full`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="PT Graha Pusri Medika - Rumah Sakit Pusri"
      >
        <defs>
          <linearGradient id="rsRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="rsYellowStaff" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Top Border Line */}
        {showBorders && (
          <line
            x1="8"
            y1="10"
            x2="532"
            y2="10"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Emblem Left */}
        <g transform="translate(56, 48)">
          {/* Main dynamic tilted ellipse ring */}
          <ellipse
            cx="0"
            cy="0"
            rx="30"
            ry="19"
            transform="rotate(-28)"
            fill="none"
            stroke="url(#rsRingGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Inner accent ring */}
          <path
            d="M -16 12 C 4 23, 24 8, 22 -6"
            fill="none"
            stroke={isWhite ? '#60a5fa' : '#0f3b5f'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Yellow medical caduceus / pulse lightning rod */}
          <path
            d="M -15 -21 L -12 -1 L -16 3 L -10 22"
            fill="none"
            stroke="url(#rsYellowStaff)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Yellow pulse arrow / wing accent */}
          <polygon
            points="-14,-8 -20,-5 -14,-2"
            fill="#eab308"
          />
        </g>

        {/* Text Section */}
        {/* Line 1: PT GRAHA PUSRI MEDIKA */}
        <text
          x="118"
          y="40"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="13"
          fontWeight="600"
          letterSpacing="2.5"
          fill={subtextColor}
        >
          PT GRAHA PUSRI MEDIKA
        </text>

        {/* Line 2: RUMAH SAKIT PUSRI */}
        <text
          x="118"
          y="70"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="26"
          fontWeight="900"
          letterSpacing="0.8"
          fill={mainTextColor}
        >
          RUMAH SAKIT PUSRI
        </text>

        {/* Bottom Border Line */}
        {showBorders && (
          <line
            x1="8"
            y1="86"
            x2="532"
            y2="86"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
