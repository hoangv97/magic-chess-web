
import React, { useEffect, useRef } from 'react';
import { MapNode, GameSettings, BossType, MapNodeType } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';
import { DEBUG_MODE, MAP_ZONES_CONFIG, getNodeIcon, getNodeColorClass } from '../../constants';

interface MapModalProps {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  completedNodes: string[];
  onNodeSelect: (node: MapNode) => void;
  onClose: () => void;
  isReadOnly: boolean;
  settings: GameSettings;
}

export const MapModal: React.FC<MapModalProps> = ({ 
  mapNodes, currentNodeId, completedNodes, onNodeSelect, onClose, isReadOnly, settings 
}) => {
  const t = TRANSLATIONS[settings.language].map;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const currentNode = mapNodes.find(n => n.id === currentNodeId);
  const currentLevel = currentNode ? currentNode.level : 1;
  const { LEVELS_PER_ZONE, ZONE_WIDTH } = MAP_ZONES_CONFIG;
  
  const zones: { name: string, startX: number, endX: number }[] = [];
  for (let i = 0; i < 5; i++) {
     zones.push({
       name: t.zones[i] || `Zone ${i+1}`,
       startX: (i * LEVELS_PER_ZONE + 1) * ZONE_WIDTH,
       endX: (i * LEVELS_PER_ZONE + LEVELS_PER_ZONE) * ZONE_WIDTH
     });
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const targetX = currentLevel * ZONE_WIDTH;
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollLeft = targetX - containerWidth / 2 + 60; 
    }
  }, [currentLevel, mapNodes, ZONE_WIDTH]);

  const isNodeAvailable = (node: MapNode) => {
    if (isReadOnly) return false;
    if (DEBUG_MODE) return true;
    if (!currentNodeId) {
      return node.level === 1;
    }
    return currentNode?.next.includes(node.id);
  };

  return (
     <div className="absolute top-20 inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="absolute top-4 right-4 z-20">
           {isReadOnly && <Button onClick={onClose} className="bg-slate-700">{t.close}</Button>}
        </div>
        
        <div className="text-center mb-6 z-10 pointer-events-none">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700">{t.title}</h2>
          <p className="text-slate-400 text-sm shadow-black drop-shadow-md">
            {isReadOnly ? t.readOnly : t.choose}
          </p>
        </div>

        <div 
           ref={scrollContainerRef}
           className="relative w-full h-[60vh] max-h-[500px] overflow-x-auto overflow-y-hidden bg-[#2a2420] border-y-4 border-[#3e342b] shadow-2xl hide-scrollbar"
        >
           <div 
             className="relative h-full"
             style={{ width: `${(mapNodes[mapNodes.length - 1]?.x || 0) + 300}px` }}
           >
              {zones.map((zone, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 bottom-0 border-l border-white/5 bg-gradient-to-r from-white/0 to-white/5 flex flex-col items-center pt-4 text-white/10 font-black text-4xl uppercase tracking-widest pointer-events-none"
                  style={{ left: zone.startX - 60, width: (zone.endX - zone.startX) + 120 }}
                >
                  {zone.name}
                </div>
              ))}

              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#4b5563" />
                       <stop offset="100%" stopColor="#9ca3af" />
                    </linearGradient>
                 </defs>
                 {mapNodes.map(node => {
                    return node.next.map(nextId => {
                       const nextNode = mapNodes.find(n => n.id === nextId);
                       if (!nextNode) return null;
                       
                       const isPathActive = completedNodes.includes(node.id) && (completedNodes.includes(nextNode.id) || currentNodeId === node.id && isNodeAvailable(nextNode));
                       
                       return (
                          <line 
                            key={`${node.id}-${nextId}`}
                            x1={node.x} y1={`${node.y}%`}
                            x2={nextNode.x} y2={`${nextNode.y}%`}
                            stroke={completedNodes.includes(node.id) && completedNodes.includes(nextNode.id) ? "#fbbf24" : "#57534e"}
                            strokeWidth={isPathActive ? 4 : 2}
                            strokeDasharray={completedNodes.includes(node.id) && completedNodes.includes(nextNode.id) ? "0" : "8 4"}
                            className="transition-all duration-500"
                          />
                       );
                    });
                 })}
              </svg>

              {mapNodes.map(node => {
                 const isVisible = true;
                 const isCompleted = completedNodes.includes(node.id);
                 const isCurrent = currentNodeId === node.id;
                 const isAvailable = isNodeAvailable(node);
                 const isBoss = node.type === MapNodeType.BOSS;

                 if (!isVisible) return null;

                 return (
                    <div 
                       key={node.id}
                       onClick={() => isAvailable && onNodeSelect(node)}
                       style={{ left: node.x, top: `${node.y}%` }}
                       className={`
                          absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 group
                          ${isAvailable ? 'cursor-pointer z-20' : 'z-10'}
                       `}
                    >
                       <div className={`
                          flex items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-300
                          ${isBoss ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm'}
                          ${getNodeColorClass(node, isAvailable, isCompleted, isCurrent)}
                       `}>
                          {isCompleted ? '✓' : isCurrent ? '📍' : getNodeIcon(node)}
                       </div>

                       <div className={`
                          mt-2 text-[10px] font-bold px-2 py-1 rounded bg-black/80 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                          ${isCurrent ? 'opacity-100 bg-blue-900' : isAvailable ? 'opacity-100' : ''}
                       `}>
                          Lvl {node.level} {isBoss ? `- ${node.bossType?.replace('_', ' ')}` : ''}
                          <br/>
                          <span className="text-[9px] text-slate-300 uppercase">{node.type}</span>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
     </div>
  );
};
