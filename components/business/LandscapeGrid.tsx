import React, { useMemo, useState } from 'react';
import { Application, StrategyResult } from '../../types';

interface LandscapeGridProps {
  apps: (Application & { strategy: StrategyResult })[];
  onSelect: (app: Application) => void;
}

export const LandscapeGrid: React.FC<LandscapeGridProps> = ({ apps, onSelect }) => {
  const [heatmapMode, setHeatmapMode] = useState<'health' | 'strategy'>('health');

  const groupedApps = useMemo(() => {
    // Group apps by capabilityId
    const groups: Record<string, typeof apps> = {};
    apps.forEach(app => {
      if (!groups[app.capabilityId]) groups[app.capabilityId] = [];
      groups[app.capabilityId].push(app);
    });
    return groups;
  }, [apps]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-emerald-500';
    if (health >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col">
       {/* Toolbar */}
       <div className="flex justify-between items-center mb-6">
         <p className="text-sm text-gray-500">
           Visualizing {apps.length} applications across {Object.keys(groupedApps).length} capabilities.
         </p>
         
         <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
           <button
             onClick={() => setHeatmapMode('health')}
             className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
               heatmapMode === 'health' 
                 ? 'bg-gray-800 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             Health Heatmap
           </button>
           <button
             onClick={() => setHeatmapMode('strategy')}
             className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
               heatmapMode === 'strategy' 
                 ? 'bg-gray-800 text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
             }`}
           >
             Strategy View
           </button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 overflow-auto">
         {Object.entries(groupedApps).map(([capability, groupApps]) => {
           // Bloat Detection: > 3 Apps implies redundancy
           const isBloated = groupApps.length > 3;
           
           return (
             <div 
                key={capability} 
                className={`
                  rounded-3xl p-5 border transition-all duration-300
                  ${isBloated 
                    ? 'bg-amber-50/80 border-amber-200 hover:shadow-amber-100' 
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                  }
                `}
             >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm tracking-tight">{capability}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">({groupApps.length})</span>
                  </div>
                  {isBloated && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                      RATIONALIZE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {groupApps.map(app => (
                    <div 
                      key={app.id}
                      onClick={() => onSelect(app)}
                      className={`
                        relative p-3 rounded-xl border cursor-pointer hover:scale-[1.02] transition-all group
                        ${heatmapMode === 'health' 
                           ? 'bg-white border-gray-100 hover:border-blue-300' 
                           : `${app.strategy.color} bg-opacity-10 border-transparent`
                        }
                      `}
                    >
                      {heatmapMode === 'health' && (
                        <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${getHealthColor(app.health)} ring-2 ring-white`} />
                      )}
                      
                      <div className="text-[10px] font-mono text-gray-400 mb-1.5">{app.code}</div>
                      <div className="text-sm font-medium text-gray-800 leading-snug mb-2 pr-2 line-clamp-2">
                        {app.name}
                      </div>
                      
                      {heatmapMode === 'strategy' && (
                         <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                           {app.strategy.disposition}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>
           );
         })}
       </div>
    </div>
  );
};