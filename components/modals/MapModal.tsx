
import React, { useEffect, useRef, useState } from 'react';
import { MapNode } from '../../types';
import { Button } from '../ui/Button';

interface MapModalProps {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  completedNodes: string[];
  onNodeSelect: (node: MapNode) => void;
  onClose: () => void;
  isReadOnly: boolean;
}

const ZONE_NAMES = [
  "The Outskirts",
  "Shadow Forest",
  "Forgotten Ruins",
  "Dragon's Peak",
  "The Void"
];

export const MapModal: React.FC<MapModalProps> = ({ 
  mapNodes, currentNodeId, completedNodes, onNodeSelect, onClose, isReadOnly 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Find current node object
  const currentNode = mapNodes.find(n => n.id === currentNodeId);
  const currentLevel = currentNode ? currentNode.level : 1;
  
  // Calculate max level visible: Show up to Current + 10
  const maxVisibleLevel = currentLevel + 10;
  
  // Filter nodes for rendering logic (though we might render all for structure, but hide via CSS/Scroll)
  // Rendering all ensures SVG lines are correct, but we clip the container view.
  // Actually, we should render everything for the "endless" feel but scroll to current.
  
  // Group nodes by Zone for markers
  const zones: { name: string, startX: number, endX: number }[] = [];
  for (let i = 0; i < 5; i++) {
     // Approx positions
     zones.push({
       name: ZONE_NAMES[i] || `Zone ${i+1}`,
       startX: (i * 10 + 1) * 120,
       endX: (i * 10 + 10) * 120
     });
  }

  // Scroll to current level on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Find X position of current level
      // Nodes are generated with x = level * 120
      const targetX = currentLevel * 120;
      const containerWidth = scrollContainerRef.current.clientWidth;
      
      // Center the view on current level
      scrollContainerRef.current.scrollLeft = targetX - containerWidth / 2 + 60; // +60 to center the node
    }
  }, [currentLevel, mapNodes]);

  // Helper to check availability
  const isNodeAvailable = (node: MapNode) => {
    if (isReadOnly) return false;
    // If start of game (no current node), allow level 1 nodes
    if (!currentNodeId) {
      return node.level === 1;
    }
    // Otherwise, must be a direct child of current node
    return currentNode?.next.includes(node.id);
  };

  return (
     <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="absolute top-4 right-4 z-20">
           {isReadOnly && <Button onClick={onClose} className="bg-slate-700">Close Map</Button>}
        </div>
        
        <div className="text-center mb-6 z-10 pointer-events-none">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700">CAMPAIGN MAP</h2>
          <p className="text-slate-400 text-sm shadow-black drop-shadow-md">
            {isReadOnly ? "The path traveled..." : "Choose your next move..."}
          </p>
        </div>

        {/* Scroll Container */}
        <div 
           ref={scrollContainerRef}
           className="relative w-full h-[60vh] max-h-[500px] overflow-x-auto overflow-y-hidden bg-[#2a2420] border-y-4 border-[#3e342b] shadow-2xl hide-scrollbar"
        >
           {/* Inner Content - Dynamic Width */}
           <div 
             className="relative h-full"
             style={{ width: `${(mapNodes[mapNodes.length - 1]?.x || 0) + 300}px` }}
           >
              {/* Background Zones */}
              {zones.map((zone, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 bottom-0 border-l border-white/5 bg-gradient-to-r from-white/0 to-white/5 flex flex-col items-center pt-4 text-white/10 font-black text-4xl uppercase tracking-widest pointer-events-none"
                  style={{ left: zone.startX - 60, width: (zone.endX - zone.startX) + 120 }}
                >
                  {zone.name}
                </div>
              ))}

              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#4b5563" />
                       <stop offset="100%" stopColor="#9ca3af" />
                    </linearGradient>
                 </defs>
                 {mapNodes.map(node => {
                    // Only draw lines if node level is visible (optimization)
                    // if (node.level > maxVisibleLevel) return null;
                    
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

              {/* Nodes */}
              {mapNodes.map(node => {
                 // Hide nodes far ahead to reduce clutter if requested, but let's just render them all for the "endless" feel since we have scroll
                 // Optionally add fog of war:
                 const isVisible = node.level <= maxVisibleLevel;
                 const isCompleted = completedNodes.includes(node.id);
                 const isCurrent = currentNodeId === node.id;
                 const isAvailable = isNodeAvailable(node);
                 const isLocked = !isCompleted && !isCurrent && !isAvailable;

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
                          ${node.name === 'Boss' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm'}
                          ${isAvailable ? 'hover:scale-125 bg-yellow-900/80 border-yellow-400 animate-bounce' : ''}
                          ${isCompleted ? 'bg-green-800 border-green-500 text-green-200' : ''}
                          ${isCurrent ? 'bg-blue-600 border-blue-400 text-white scale-125 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : ''}
                          ${isLocked ? 'bg-slate-800 border-slate-600 text-slate-600' : ''}
                       `}>
                          {isCompleted ? '✓' : isCurrent ? '📍' : isAvailable ? '⚔️' : isLocked ? '🔒' : ''}
                          {node.name === 'Boss' && !isCompleted && !isCurrent && !isAvailable && '☠️'}
                       </div>

                       {/* Tooltip / Label */}
                       <div className={`
                          mt-2 text-[10px] font-bold px-2 py-1 rounded bg-black/80 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                          ${isCurrent ? 'opacity-100 bg-blue-900' : ''}
                       `}>
                          Lvl {node.level} {node.name ? `- ${node.name}` : ''}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
     </div>
  );
};
