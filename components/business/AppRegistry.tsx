import React, { useMemo } from 'react';
import { Application, AppValue, StrategyResult } from '../../types';

interface AppRegistryProps {
  apps: (Application & { strategy: StrategyResult })[];
  onSelect: (app: Application) => void;
}

/**
 * IndustrialRegistry
 * Refactored Registry for EAPM based on Dragon1 Methodology.
 * Features: High-density layout, Business Capability Grouping, and Sticky Actions.
 */
export const AppRegistry: React.FC<AppRegistryProps> = ({ apps: applications, onSelect: onRowClick }) => {

  // CHAPTER 4: STRATEGY ENGINE LOGIC (Adapted for existing data types)
  const getStrategyDisposition = (app: Application) => {
    // Mapping existing AppValue to Business Criticality logic
    const isCritical = app.value === AppValue.CRITICAL || app.value === AppValue.HIGH;
    
    // Mapping Health to Lifecycle Status logic
    let lifecycleStatus = 'ACTIVE';
    if (app.health < 50) lifecycleStatus = 'EOL';
    else if (app.health < 80) lifecycleStatus = 'PHASE_OUT';

    const isLegacy = lifecycleStatus === 'EOL' || lifecycleStatus === 'PHASE_OUT';

    // Strategy Logic
    if (isCritical && !isLegacy) return { label: 'INVEST', color: 'bg-green-100 text-green-800 border-green-200' };
    if (isCritical && isLegacy) return { label: 'MIGRATE', color: 'bg-red-100 text-red-800 border-red-200 animate-pulse' };
    if (!isCritical && !isLegacy) return { label: 'TOLERATE', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    
    // Low Criticality + Legacy = Eliminate
    return { label: 'ELIMINATE', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  const getLifecycleStatus = (health: number) => {
    if (health < 50) return { label: 'EOL', color: 'bg-red-500' };
    if (health < 80) return { label: 'PHASE_OUT', color: 'bg-amber-500' };
    return { label: 'ACTIVE', color: 'bg-green-500' };
  };

  // Grouping Logic: Group rows by Business Capability
  const groupedApps = useMemo(() => {
    return applications.reduce((acc, app) => {
      const group = app.capabilityId || 'Unassigned';
      if (!acc[group]) acc[group] = [];
      acc[group].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [applications]);

  const totalCost = applications.reduce((sum, a) => sum + (a.costs.total || 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#F0F4F9] p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col h-full">

        {/* TABLE VIEWPORT */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
              <tr className="h-10 text-slate-500 uppercase tracking-wider font-bold">
                <th className="sticky left-0 bg-slate-50 px-4 text-left z-40 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Application Name
                </th>
                <th className="px-3 text-left">Code</th>
                <th className="px-3 text-left">Tier</th>
                <th className="px-3 text-left">Criticality</th>
                <th className="px-3 text-left">Lifecycle</th>
                <th className="px-3 text-right">Annual Cost</th>
                <th className="sticky right-0 bg-slate-50 px-4 text-center z-40 border-l border-slate-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Strategy
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {Object.entries(groupedApps).map(([capability, apps]) => (
                <React.Fragment key={capability}>
                  {/* GROUP HEADER */}
                  <tr className="bg-slate-50/50 h-8">
                    <td colSpan={8} className="px-4 font-black text-[10px] text-blue-600 uppercase tracking-widest border-y border-slate-200/50">
                      Capability: {capability} <span className="ml-2 text-slate-400 font-normal">({apps.length} Assets)</span>
                    </td>
                  </tr>

                  {/* DATA ROWS */}
                  {apps.map((app) => {
                    const strategy = getStrategyDisposition(app);
                    const lifecycle = getLifecycleStatus(app.health);
                    
                    return (
                      <tr
                        key={app.id}
                        onClick={() => onRowClick?.(app)}
                        className="h-8 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        {/* STICKY NAME */}
                        <td className="sticky left-0 bg-white group-hover:bg-blue-50/50 px-4 font-bold text-slate-800 border-r border-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                          {app.name}
                        </td>
                        <td className="px-3 text-slate-500 font-mono">{app.code}</td>
                        <td className="px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {app.tier}
                          </span>
                        </td>
                        <td className="px-3">
                           <span className={`font-bold ${
                             (app.value === AppValue.CRITICAL || app.value === AppValue.HIGH) ? 'text-amber-600' : 'text-slate-400'
                           }`}>
                            {app.value}
                           </span>
                        </td>
                        <td className="px-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${lifecycle.color}`} />
                            {lifecycle.label}
                          </div>
                        </td>
                        <td className="px-3 text-right font-mono text-slate-500">
                           ${(app.costs.total || 0).toLocaleString()}
                        </td>

                        {/* STICKY STRATEGY BADGE */}
                        <td className="sticky right-0 bg-white group-hover:bg-blue-50/50 px-4 border-l border-slate-100 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                          <div className={`mx-auto w-20 text-center py-0.5 rounded-full text-[9px] font-black border ${strategy.color}`}>
                            {strategy.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER STATS */}
        <div className="bg-slate-50 px-6 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 shrink-0">
          <div className="flex gap-4">
            <span>TOTAL ASSETS: {applications.length}</span>
            <span>TOTAL TCO: ${totalCost.toLocaleString()}</span>
          </div>
          <div className="uppercase tracking-widest hidden sm:block">Enterprise Architecture Repository</div>
        </div>
      </div>
    </div>
  );
};