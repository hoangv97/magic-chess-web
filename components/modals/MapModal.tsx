
import React from 'react';
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

export const MapModal: React.FC<MapModalProps> = ({ 
  mapNodes, currentNodeId, completedNodes, onNodeSelect, onClose, isReadOnly 
}) => {
  
  // Helper to check availability
  const isNodeAvailable = (node: MapNode) => {
    if (isReadOnly) return false;
    // If start of game (no current node), allow level 1 nodes (nodes with no parents ideally, or just hardcoded level 1)
    if (!currentNodeId) {
      return node.level === 1;
    }
    // Otherwise, must be a direct child of current node
    const currentNode = mapNodes.find(n => n.id === currentNodeId);
    return currentNode?.next.includes(node.id);
  };

  return (
     <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4 z-10">
           {isReadOnly && <Button onClick={onClose} className="bg-slate-700">Close Map</Button>}
        </div>
        
        <div className="text-center mb-4 z-10 pointer-events-none">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700">CAMPAIGN MAP</h2>
          <p className="text-slate-400 text-sm shadow-black drop-shadow-md">
            {isReadOnly ? "Your journey so far..." : "Choose your next battle..."}
          </p>
        </div>

        <div className="relative w-full max-w-2xl aspect-[3/4] bg-[#2a2420] rounded-xl shadow-2xl overflow-hidden border-4 border-[#3e342b]">
           {/* Parchment texture overlay could go here */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,transparent_20%,#000_120%)] pointer-events-none" />

           {/* SVG Lines */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {mapNodes.map(node => {
                 return node.next.map(nextId => {
                    const nextNode = mapNodes.find(n => n.id === nextId);
                    if (!nextNode) return null;
                    return (
                       <line 
                         key={`${node.id}-${nextId}`}
                         x1={`${node.x}%`} y1={`${node.y}%`}
                         x2={`${nextNode.x}%`} y2={`${nextNode.y}%`}
                         stroke={completedNodes.includes(node.id) && completedNodes.includes(nextNode.id) ? "#fbbf24" : "#57534e"}
                         strokeWidth="2"
                         strokeDasharray="4 4"
                         className="opacity-50"
                       />
                    );
                 });
              })}
           </svg>

           {/* Nodes */}
           {mapNodes.map(node => {
              const isCompleted = completedNodes.includes(node.id);
              const isCurrent = currentNodeId === node.id;
              const isAvailable = isNodeAvailable(node);
              const isLocked = !isCompleted && !isCurrent && !isAvailable;

              return (
                 <div 
                    key={node.id}
                    onClick={() => isAvailable && onNodeSelect(node)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className={`
                       absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300
                       ${isAvailable ? 'cursor-pointer hover:scale-125 bg-yellow-900/50 border-yellow-400 animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
                       ${isCompleted ? 'bg-green-800 border-green-500 text-green-200' : ''}
                       ${isCurrent ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg ring-4 ring-blue-500/30' : ''}
                       ${isLocked ? 'bg-slate-800 border-slate-600 text-slate-600' : ''}
                    `}
                 >
                    {isCompleted ? '✓' : isCurrent ? '📍' : isAvailable ? '⚔️' : isLocked ? '🔒' : node.level}
                    
                    {/* Tooltip Label */}
                    <div className="absolute top-full mt-2 bg-black/80 text-white text-[10px] md:text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                       Lvl {node.level} - {node.name}
                    </div>
                 </div>
              );
           })}
        </div>
     </div>
  );
};
