
import { MapNodeType, BossType, MapNode } from '../types';
import { getBossIcon } from './bosses';

export const MAP_ZONES_CONFIG = {
    LEVELS_PER_ZONE: 10,
    ZONE_WIDTH: 120
};

export const getNodeIcon = (node: MapNode) => {
    if (node.type === MapNodeType.BOSS) return getBossIcon(node.bossType || BossType.NONE);
    if (node.type === MapNodeType.MINI_BOSS) return '👹';
    if (node.type === MapNodeType.SHOP) return '💰';
    if (node.type === MapNodeType.REST) return '🔥';
    if (node.type === MapNodeType.UNKNOWN) return '❓';
    return '⚔️';
};

export const getNodeColorClass = (node: MapNode, isAvailable: boolean, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return 'bg-green-800 border-green-500 text-green-200';
    if (isCurrent) return 'bg-blue-600 border-blue-400 text-white scale-125 shadow-[0_0_20px_rgba(59,130,246,0.6)]';
    if (isAvailable) {
        if (node.type === MapNodeType.BOSS) return 'bg-red-900/80 border-red-500 text-white hover:scale-125 animate-bounce';
        if (node.type === MapNodeType.MINI_BOSS) return 'bg-orange-800/90 border-orange-500 text-white hover:scale-125 animate-bounce shadow-[0_0_15px_rgba(249,115,22,0.6)]';
        if (node.type === MapNodeType.SHOP) return 'bg-yellow-700/80 border-yellow-400 text-white hover:scale-125 animate-bounce';
        if (node.type === MapNodeType.REST) return 'bg-orange-800/80 border-orange-400 text-white hover:scale-125 animate-bounce';
        if (node.type === MapNodeType.UNKNOWN) return 'bg-purple-800/80 border-purple-400 text-white hover:scale-125 animate-bounce';
        return 'bg-slate-700/80 border-slate-400 text-white animate-bounce hover:scale-125 hover:bg-slate-600';
    }
    return 'bg-slate-800 border-slate-600 text-slate-600';
};
