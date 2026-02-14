import React from 'react';

export const HealthBar: React.FC<{ value: number }> = ({ value }) => {
  let colorClass = 'bg-gray-300';
  if (value >= 80) colorClass = 'bg-emerald-500';
  else if (value >= 50) colorClass = 'bg-yellow-500';
  else colorClass = 'bg-red-500';

  return (
    <div className="flex items-center gap-2 w-full max-w-[100px]">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500 w-6 text-right">{value}</span>
    </div>
  );
};
