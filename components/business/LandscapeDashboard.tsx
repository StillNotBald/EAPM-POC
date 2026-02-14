import React, { useMemo } from 'react';
import { Application } from '../../types';

// PART 4: LANDSCAPE BLUEPRINT (The City Map)

interface LandscapeDashboardProps {
  apps: Application[];
  onSelect: (app: Application) => void;
}

export const LandscapeDashboard: React.FC<LandscapeDashboardProps> = ({ apps, onSelect }) => {
  
  // Grouping: Domain -> Capability -> Apps
  const landscape = useMemo(() => {
    const tree: Record<string, Record<string, Application[]>> = {};
    
    apps.forEach(app => {
      const domain = app.domain || 'Unassigned';
      const cap = app.capabilityId || 'General';
      
      if (!tree[domain]) tree[domain] = {};
      if (!tree[domain][cap]) tree[domain][cap] = [];
      tree[domain][cap].push(app);
    });
    
    return tree;
  }, [apps]);

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#F0F4F9]">
      <div className="max-w-[1800px] mx-auto space-y-12">
        
        {Object.entries(landscape).map(([domain, capabilities]) => {
          const domainCost = Object.values(capabilities).flat().reduce((acc, app) => acc + app.costs.total, 0);
          
          return (
            <div key={domain} className="space-y-4">
              {/* Domain Header */}
              <div className="flex items-baseline justify-between border-b border-slate-300 pb-2">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{domain} DOMAIN</h2>
                <span className="font-mono text-slate-500 font-medium">Domain Spend: ${domainCost.toLocaleString()}</span>
              </div>

              {/* Capability Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(capabilities).map(([capability, capApps]) => {
                  const isRedundant = capApps.length > 3; // Dragon1 Rule: >3 apps = Redundancy Risk
                  
                  return (
                    <div 
                      key={capability} 
                      className={`
                        rounded-2xl border-2 p-5 flex flex-col h-full transition-all
                        ${isRedundant ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-700 text-sm">{capability}</h3>
                        {isRedundant && (
                          <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                            REDUNDANT
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {capApps.map(app => (
                          <div 
                            key={app.id}
                            onClick={() => onSelect(app)}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">{app.name}</span>
                              <div className={`w-2 h-2 rounded-full ${app.lifecycle.status === 'EOL' ? 'bg-red-500' : 'bg-emerald-400'}`} />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>{app.code}</span>
                              <span>${(app.costs.total / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100/50 text-[10px] text-slate-400 text-center font-medium">
                        {capApps.length} Applications
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};