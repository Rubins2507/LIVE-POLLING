import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LivePollLogo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const barSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
      <div className={`relative flex items-end gap-1 ${barSizes[size]}`}>
        <span className="w-1.5 h-3 bg-blue-600 rounded-sm" />
        <span className="w-1.5 h-5 bg-blue-600 rounded-sm" />
        <span className="w-1.5 h-6 bg-blue-600 rounded-sm" />
      </div>
      <span className={`text-slate-900 font-extrabold ${textSizes[size]}`}>
        Live<span className="text-slate-900">Poll</span>
      </span>
    </div>
  );
};
