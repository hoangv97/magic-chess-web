
import { v4 as uuidv4 } from 'uuid';
import { MapNode } from '../types';

export const generateCampaignMap = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const LEVELS_PER_ZONE = 10;
  const TOTAL_ZONES = 5; // 50 levels total for this "endless" feel
  const TOTAL_LEVELS = TOTAL_ZONES * LEVELS_PER_ZONE;
  const STEP_X = 120; // Pixels between levels

  let prevNodes: MapNode[] = [];

  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    const isBoss = level % LEVELS_PER_ZONE === 0;
    const isStartOfZone = (level - 1) % LEVELS_PER_ZONE === 0;

    let nodeCount = 1;
    
    // Logic for branching
    if (isBoss || isStartOfZone) {
      nodeCount = 1;
    } else {
      // If previous was 1, chance to split
      if (prevNodes.length === 1) {
        nodeCount = Math.random() > 0.4 ? 2 : 1;
      } 
      // If previous was 2, chance to merge
      else if (prevNodes.length === 2) {
        nodeCount = Math.random() > 0.6 ? 2 : 1; 
      }
    }

    const currentLevelNodes: MapNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const id = uuidv4();
      let y = 50; // Center percentage

      if (nodeCount === 2) {
        y = i === 0 ? 35 : 65;
      }

      const newNode: MapNode = {
        id,
        level,
        x: level * STEP_X, // Horizontal position in pixels
        y,
        next: [],
        name: isBoss ? 'Boss' : undefined
      };
      
      nodes.push(newNode);
      currentLevelNodes.push(newNode);
    }

    // Connect previous nodes to current nodes
    if (prevNodes.length > 0) {
      if (prevNodes.length === 1 && currentLevelNodes.length === 1) {
         prevNodes[0].next.push(currentLevelNodes[0].id);
      } else if (prevNodes.length === 1 && currentLevelNodes.length === 2) {
         prevNodes[0].next.push(currentLevelNodes[0].id);
         prevNodes[0].next.push(currentLevelNodes[1].id);
      } else if (prevNodes.length === 2 && currentLevelNodes.length === 1) {
         prevNodes[0].next.push(currentLevelNodes[0].id);
         prevNodes[1].next.push(currentLevelNodes[0].id);
      } else if (prevNodes.length === 2 && currentLevelNodes.length === 2) {
         // Parallel
         prevNodes[0].next.push(currentLevelNodes[0].id);
         prevNodes[1].next.push(currentLevelNodes[1].id);
      }
    }

    prevNodes = currentLevelNodes;
  }

  return nodes;
};
