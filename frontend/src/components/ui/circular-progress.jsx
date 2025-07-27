import React from 'react';

const CircularProgress = ({ 
  value = 0, 
  size = 120, 
  strokeWidth = 8, 
  showValue = true, 
  className = "",
  label = "",
  color = "blue" 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Color schemes based on the Hirey Wirey theme
  const colorSchemes = {
    blue: {
      gradient: ['#3B82F6', '#8B5CF6'], // blue-500 to purple-500
      track: '#E5E7EB', // gray-200
      text: 'text-blue-600'
    },
    green: {
      gradient: ['#10B981', '#059669'], // emerald-500 to emerald-600
      track: '#E5E7EB',
      text: 'text-emerald-600'
    },
    orange: {
      gradient: ['#F59E0B', '#D97706'], // amber-500 to amber-600
      track: '#E5E7EB',
      text: 'text-amber-600'
    },
    red: {
      gradient: ['#EF4444', '#DC2626'], // red-500 to red-600
      track: '#E5E7EB',
      text: 'text-red-600'
    }
  };

  // Determine color based on score
  const getColorByScore = (score) => {
    if (score >= 80) return colorSchemes.green;
    if (score >= 60) return colorSchemes.blue;
    if (score >= 40) return colorSchemes.orange;
    return colorSchemes.red;
  };

  const currentColorScheme = color === "auto" ? getColorByScore(value) : colorSchemes[color] || colorSchemes.blue;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentColorScheme.gradient[0]} />
            <stop offset="100%" stopColor={currentColorScheme.gradient[1]} />
          </linearGradient>
          
          {/* Add shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={currentColorScheme.gradient[0]} floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColorScheme.track}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#shadow)"
          className="transition-all duration-1000 ease-out"
          style={{
            transformOrigin: 'center',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <div className={`text-3xl font-bold ${currentColorScheme.text}`}>
            {Math.round(value)}
          </div>
        )}
        {label && (
          <div className="text-xs text-gray-500 mt-1 text-center font-medium">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
