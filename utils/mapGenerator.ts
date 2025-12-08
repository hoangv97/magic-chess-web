
import { v4 as uuidv4 } from 'uuid';
import { MapNode, BossType, MapNodeType } from '../types';
import { getWeightedRandomItem } from './random';

export const generateCampaignMap = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const LEVELS_PER_ZONE = 10;
  const TOTAL_ZONES = 5; 
  const TOTAL_LEVELS = TOTAL_ZONES * LEVELS_PER_ZONE;
  const STEP_X = 120; // Pixels between levels
  const BOSS_FREQUENCY = 2;

  let prevNodes: MapNode[] = [];

  const bossTypes = [
      // BossType.FROST_GIANT, 
      // BossType.BLIZZARD_WITCH,
      // BossType.VOID_BRINGER, 
      // BossType.LAVA_TITAN, 
      // BossType.STONE_GOLEM,
      // BossType.UNDEAD_LORD,
      // BossType.CHAOS_LORD,
      // BossType.MIRROR_MAGE,
      // BossType.SOUL_EATER,
      // BossType.BLOOD_KING,
      // BossType.HYDRA,
      // BossType.MIND_CONTROLLER,
      // BossType.SILENCER,
      // BossType.ILLUSIONIST,
      // BossType.THE_FACELESS,
      BossType.CURSE_WEAVER,
      BossType.DOOM_BRINGER,
      BossType.SOUL_CORRUPTOR
  ];

  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    // Boss appears every 5 levels
    const isBoss = level % BOSS_FREQUENCY === 0;
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

    // Determine Types for nodes in this level
    const nodeTypes: MapNodeType[] = [];

    if (isBoss) {
        nodeTypes.push(MapNodeType.BOSS);
    } else if (level === 1) {
        nodeTypes.push(MapNodeType.BATTLE);
    } else {
        if (nodeCount > 1) {
            // Branching Rule:
            // When appear branches, mini boss should appear with reward node like shop, rest, unknown.
            // Other branches must not have mini boss anymore.
            
            const hasMiniBoss = Math.random() < 0.25; // 25% chance for a branching choice to include a high risk option
            
            if (hasMiniBoss) {
                nodeTypes.push(MapNodeType.MINI_BOSS);
                // The remaining nodes MUST be reward types
                for (let i = 1; i < nodeCount; i++) {
                    const rewardType = getWeightedRandomItem(
                        [MapNodeType.BATTLE, MapNodeType.SHOP, MapNodeType.REST, MapNodeType.UNKNOWN],
                        (t) => 1 // Equal weight for rewards
                    );
                    nodeTypes.push(rewardType);
                }
            } else {
                // Standard distribution for splits (no mini boss forced)
                for (let i = 0; i < nodeCount; i++) {
                    nodeTypes.push(getRandomNodeType());
                }
            }
            
            // Shuffle to randomize positions (Top vs Bottom)
            for (let i = nodeTypes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nodeTypes[i], nodeTypes[j]] = [nodeTypes[j], nodeTypes[i]];
            }

        } else {
            // Single Node: Standard random
            nodeTypes.push(getRandomNodeType());
        }
    }

    const currentLevelNodes: MapNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const id = uuidv4();
      let y = 50; // Center percentage

      if (nodeCount === 2) {
        y = i === 0 ? 35 : 65;
      }

      let bossType = BossType.NONE;
      let name = undefined;
      const type = nodeTypes[i];

      if (type === MapNodeType.BOSS) {
          name = 'Boss';
          bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
      }

      const newNode: MapNode = {
        id,
        level,
        x: level * STEP_X, // Horizontal position in pixels
        y,
        next: [],
        name,
        bossType,
        type
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

const getRandomNodeType = (): MapNodeType => {
    return getWeightedRandomItem(
        [MapNodeType.BATTLE, MapNodeType.MINI_BOSS, MapNodeType.SHOP, MapNodeType.REST, MapNodeType.UNKNOWN],
        (type) => {
            switch(type) {
                case MapNodeType.BATTLE: return 0.45;
                case MapNodeType.MINI_BOSS: return 0.10;
                case MapNodeType.SHOP: return 0.15;
                case MapNodeType.REST: return 0.15;
                case MapNodeType.UNKNOWN: return 0.15;
                default: return 0;
            }
        }
    );
};
