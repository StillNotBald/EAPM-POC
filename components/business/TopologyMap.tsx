import React, { useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, MarkerType, Edge, Node } from 'reactflow';
import { Application } from '../../types';

interface TopologyMapProps {
  apps: Application[];
  onSelect: (app: Application) => void;
  scope: string;
}

type ViewMode = 'DEFAULT' | 'SECURITY' | 'TECH_DEBT' | 'COST';

const TIER_X = {
  'CHANNEL': 0,
  'INTEGRATION': 400,
  'CORE': 800,
  'INFRA': 1200
};

// 3.1 SMART NODE COMPONENT
const SmartNode = ({ data }: { data: Application & { viewMode: ViewMode } }) => {
  const { viewMode } = data;

  // View Logic: Security
  const securityBorder = data.security.piiRisk === 'HIGH' ? 'border-red-500 ring-4 ring-red-100' : 'border-green-500';
  
  // View Logic: Tech Debt (Scale)
  const debtScale = data.technicalDebt === 'HIGH' ? 'scale-110' : data.technicalDebt === 'MEDIUM' ? 'scale-100' : 'scale-90';
  
  // View Logic: Cost (Gradient)
  const costIntensity = Math.min(data.costs.total / 1000000, 1); // Normalize to 1M
  const costBg = `rgba(220, 38, 38, ${costIntensity * 0.2})`; // Red tint based on cost

  let containerClass = "w-64 p-4 rounded-3xl bg-white border-2 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ";
  
  if (viewMode === 'SECURITY') {
    containerClass += securityBorder;
  } else if (viewMode === 'TECH_DEBT') {
    containerClass += ` ${debtScale} ${data.technicalDebt === 'HIGH' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`;
  } else if (viewMode === 'COST') {
    containerClass += " border-slate-200";
  } else {
    containerClass += " border-slate-100 hover:border-blue-400";
  }

  return (
    <div className={containerClass} style={viewMode === 'COST' ? { backgroundColor: viewMode === 'COST' ? `rgba(255, 255, 255, 1)` : undefined, backgroundImage: `linear-gradient(to bottom right, white, ${costBg})` } : {}}>
      <Handle type="target" position={Position.Left} className="!bg-slate-300 w-3 h-3" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{data.tier}</span>
        {viewMode === 'SECURITY' && data.security.piiRisk === 'HIGH' && (
          <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">PII RISK</span>
        )}
        {viewMode === 'TECH_DEBT' && data.technicalDebt === 'HIGH' && (
          <span className="bg-amber-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">HIGH DEBT</span>
        )}
      </div>

      <h4 className="text-sm font-black text-slate-800 mb-1 truncate" title={data.name}>{data.name}</h4>
      <p className="text-[10px] text-slate-500 font-mono mb-3">{data.code}</p>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        {viewMode === 'COST' ? (
          <span className="text-xs font-bold text-slate-700">${(data.costs.total / 1000).toFixed(0)}k</span>
        ) : (
          <span className="text-[9px] font-bold text-blue-600">{data.capabilityId}</span>
        )}
        
        {data.lifecycle.status === 'EOL' && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="EOL System"></span>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-slate-300 w-3 h-3" />
    </div>
  );
};

const nodeTypes = { smartNode: SmartNode };

export const TopologyMap: React.FC<TopologyMapProps> = ({ apps, onSelect, scope }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('DEFAULT');

  // Filter apps based on scope (Domain)
  const displayedApps = useMemo(() => {
    if (scope === 'ALL') return apps;
    return apps.filter(a => (a.domain || 'Unassigned') === scope);
  }, [apps, scope]);

  const { nodes, edges } = useMemo(() => {
    const tierCounters: Record<string, number> = {};

    const _nodes: Node[] = displayedApps.map(app => {
      const tier = app.tier;
      if (tierCounters[tier] === undefined) tierCounters[tier] = 0;
      
      const x = TIER_X[tier] || 0;
      const y = tierCounters[tier] * 180 + 50; // 180px spacing
      tierCounters[tier]++;

      return {
        id: app.id,
        type: 'smartNode',
        position: { x, y },
        data: { ...app, viewMode }
      };
    });

    // Create a set of displayed node IDs for edge filtering
    const displayedNodeIds = new Set(displayedApps.map(a => a.id));

    const _edges: Edge[] = [];
    displayedApps.forEach(source => {
      source.downstreamIds.forEach(targetId => {
        // Only draw edge if both nodes are in the current view
        if (displayedNodeIds.has(targetId)) {
          const isHighRisk = source.security.piiRisk === 'HIGH';
          _edges.push({
            id: `${source.id}-${targetId}`,
            source: source.id,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: viewMode === 'SECURITY' && isHighRisk ? '#ef4444' : '#cbd5e1',
              strokeWidth: viewMode === 'SECURITY' && isHighRisk ? 3 : 1.5
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' }
          });
        }
      });
    });

    return { nodes: _nodes, edges: _edges };
  }, [displayedApps, viewMode]);

  return (
    <div className="w-full h-full bg-[#F0F4F9] rounded-3xl overflow-hidden border border-black/5 relative flex flex-col">
      
      {/* Floating Toolbar (Lens Only) */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-full max-w-2xl px-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-1.5 border border-slate-200 flex gap-1 pointer-events-auto">
           {(['DEFAULT', 'SECURITY', 'TECH_DEBT', 'COST'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                  viewMode === mode 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        className="flex-1"
        onNodeClick={(_, node) => {
          const app = apps.find(a => a.id === node.id);
          if (app) onSelect(app);
        }}
      >
        <Background color="#94a3b8" gap={40} size={1} />
        <Controls className="bg-white border-none shadow-xl rounded-xl" />
      </ReactFlow>
    </div>
  );
};