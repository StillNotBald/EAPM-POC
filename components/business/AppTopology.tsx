import React, { useMemo } from 'react';
import { Application, AppTier, StrategyResult } from '../../types';

interface AppTopologyProps {
  apps: (Application & { strategy: StrategyResult })[];
  onSelect: (app: Application) => void;
}

const TIER_X = {
  [AppTier.CHANNEL]: 100,
  [AppTier.INTEGRATION]: 400,
  [AppTier.CORE]: 700,
  [AppTier.INFRA]: 1000,
};

const COLUMN_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_WIDTH = 180;
const Y_SPACING = 120;

export const AppTopology: React.FC<AppTopologyProps> = ({ apps, onSelect }) => {
  // Calculate positions
  const { nodes, edges, maxHeight } = useMemo(() => {
    const tierCounts: Record<string, number> = {
      [AppTier.CHANNEL]: 0,
      [AppTier.INTEGRATION]: 0,
      [AppTier.CORE]: 0,
      [AppTier.INFRA]: 0
    };

    const _nodes = apps.map(app => {
      const index = tierCounts[app.tier];
      tierCounts[app.tier]++;
      return {
        ...app,
        x: TIER_X[app.tier],
        y: index * Y_SPACING + 100
      };
    });

    const _edges: { id: string; from: typeof _nodes[0]; to: typeof _nodes[0]; risk: boolean }[] = [];
    
    _nodes.forEach(source => {
      source.downstreamIds.forEach(targetId => {
        const target = _nodes.find(n => n.id === targetId);
        if (target) {
          _edges.push({
            id: `${source.id}-${target.id}`,
            from: source,
            to: target,
            risk: source.security.piiRisk === 'HIGH' || target.security.piiRisk === 'HIGH'
          });
        }
      });
    });

    const maxRows = Math.max(...Object.values(tierCounts));
    
    return { nodes: _nodes, edges: _edges, maxHeight: maxRows * Y_SPACING + 200 };
  }, [apps]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-auto h-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-lg text-sm text-gray-500 pointer-events-none">
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-0.5 bg-red-500"></span> PII Data Flow</div>
        <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-gray-300"></span> Standard Flow</div>
      </div>

      <svg width="1200" height={Math.max(600, maxHeight)} className="min-w-[1200px]">
        {/* Tier Columns Background */}
        <text x={TIER_X[AppTier.CHANNEL]} y="40" textAnchor="middle" className="text-sm font-bold fill-gray-400">CHANNEL</text>
        <line x1={TIER_X[AppTier.CHANNEL]} y1="60" x2={TIER_X[AppTier.CHANNEL]} y2="100%" stroke="#f0f0f0" strokeDasharray="5,5" />
        
        <text x={TIER_X[AppTier.INTEGRATION]} y="40" textAnchor="middle" className="text-sm font-bold fill-gray-400">INTEGRATION</text>
        <line x1={TIER_X[AppTier.INTEGRATION]} y1="60" x2={TIER_X[AppTier.INTEGRATION]} y2="100%" stroke="#f0f0f0" strokeDasharray="5,5" />

        <text x={TIER_X[AppTier.CORE]} y="40" textAnchor="middle" className="text-sm font-bold fill-gray-400">CORE</text>
        <line x1={TIER_X[AppTier.CORE]} y1="60" x2={TIER_X[AppTier.CORE]} y2="100%" stroke="#f0f0f0" strokeDasharray="5,5" />

        <text x={TIER_X[AppTier.INFRA]} y="40" textAnchor="middle" className="text-sm font-bold fill-gray-400">INFRASTRUCTURE</text>
        <line x1={TIER_X[AppTier.INFRA]} y1="60" x2={TIER_X[AppTier.INFRA]} y2="100%" stroke="#f0f0f0" strokeDasharray="5,5" />

        {/* Edges */}
        {edges.map(edge => {
          const startX = edge.from.x + (NODE_WIDTH / 2);
          const startY = edge.from.y;
          const endX = edge.to.x - (NODE_WIDTH / 2);
          const endY = edge.to.y;
          
          const controlPointX1 = startX + 50;
          const controlPointX2 = endX - 50;

          return (
            <g key={edge.id}>
              <path
                d={`M ${startX} ${startY} C ${controlPointX1} ${startY}, ${controlPointX2} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={edge.risk ? '#B3261E' : '#E2E8F0'}
                strokeWidth={edge.risk ? 3 : 2}
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map(node => (
          <foreignObject 
            key={node.id} 
            x={node.x - NODE_WIDTH / 2} 
            y={node.y - NODE_HEIGHT / 2} 
            width={NODE_WIDTH} 
            height={NODE_HEIGHT}
          >
            <div 
              onClick={() => onSelect(node)}
              className="w-full h-full bg-white rounded-xl shadow-md border border-gray-200 p-3 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Health Border Bottom */}
              <div 
                className={`absolute bottom-0 left-0 h-1 w-full ${node.health > 70 ? 'bg-green-500' : node.health > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              />
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-gray-400">{node.code}</span>
                {node.security.piiRisk === 'HIGH' && <span className="w-2 h-2 rounded-full bg-red-500" title="Contains PII" />}
              </div>
              <div className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight">
                {node.name}
              </div>
              <div className="flex justify-between items-center mt-1">
                 <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${node.strategy.color} bg-opacity-20`}>
                   {node.strategy.disposition}
                 </span>
              </div>
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  );
};