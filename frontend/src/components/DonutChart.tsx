import React from 'react';
import { OptionResult } from '../types';

interface DonutChartProps {
  results: OptionResult[];
  totalVotes: number;
}

const COLORS = [
  '#2563eb', // Blue (Primary)
  '#8b5cf6', // Purple
  '#10b981', // Emerald Green
  '#f59e0b', // Amber / Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

export const DonutChart: React.FC<DonutChartProps> = ({ results, totalVotes }) => {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  let accumulatedAngle = 0;
  const segments = results.map((item, index) => {
    const fraction = totalVotes > 0 ? item.votes / totalVotes : (1 / Math.max(1, results.length));
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;

    return {
      ...item,
      color: COLORS[index % COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {totalVotes > 0 ? (
            segments.map((segment) => (
              <circle
                key={segment.optionId}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition:
                    'stroke-dasharray 800ms cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            ))
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight transition-all duration-300">
            {totalVotes}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Total Votes
          </span>
        </div>
      </div>

      {/* Legend with smooth mini progress bars */}
      <div className="flex flex-col gap-3 min-w-[170px] w-full sm:w-auto">
        {results.map((opt, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div key={opt.optionId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-slate-700 truncate max-w-[110px]" title={opt.text}>
                    {opt.text}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
                  <span className="text-slate-900 font-bold">{opt.percentage}%</span>
                  <span>({opt.votes})</span>
                </div>
              </div>
              {/* Subtle mini progress bar with smooth CSS expansion */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-2xs">
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${opt.percentage}%`,
                    backgroundColor: color,
                    willChange: 'width',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
