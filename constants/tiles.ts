
import { TileEffect, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';
import { GAME_ICONS } from '../components/assets/GameIcons';

export const getTileEffectInfo = (lang: Language, type: TileEffect) => {
  return TRANSLATIONS[lang].tiles[type];
};

export const TILE_EFFECT_INFO: Record<TileEffect, { name: string; desc: string }> = {
  [TileEffect.NONE]: { name: "Grass", desc: "Standard terrain. No special effects." },
  [TileEffect.HOLE]: { name: "Abyss", desc: "A deep chasm. Pieces cannot stand here, but sliding pieces can pass over." },
  [TileEffect.WALL]: { name: "Stone Wall", desc: "A solid obstacle. Pieces cannot enter or pass through." },
  [TileEffect.FROZEN]: { name: "Frozen Ground", desc: "Slippery ice. Entering this tile freezes piece for next turn." },
  [TileEffect.LAVA]: { name: "Magma Pool", desc: "Deadly heat. Entering this tile destroys the piece." },
  [TileEffect.PROMOTION]: { name: "Promotion Tile", desc: "Magic rune. Promotes Pawn/Rook/Bishop to Queen, Knight to Amazon." }
};

export const getTileVisuals = (type: TileEffect) => {
  switch(type) {
    case TileEffect.HOLE: return { colorClass: "bg-black border-slate-700", icon: GAME_ICONS.TILE_HOLE };
    case TileEffect.WALL: return { colorClass: "bg-stone-600 border-stone-500", icon: GAME_ICONS.TILE_WALL };
    case TileEffect.FROZEN: return { colorClass: "bg-cyan-900 border-cyan-500", icon: GAME_ICONS.TILE_FROZEN };
    case TileEffect.LAVA: return { colorClass: "bg-red-900 border-red-500", icon: GAME_ICONS.TILE_LAVA, animation: "absolute inset-0 bg-red-500/20 animate-pulse" };
    case TileEffect.PROMOTION: return { colorClass: "bg-yellow-900 border-yellow-500", icon: GAME_ICONS.TILE_PROMOTION, animation: "absolute inset-0 bg-yellow-500/10 animate-pulse" };
    case TileEffect.NONE: 
    default:
        return { colorClass: "bg-green-900/30 border-green-800", icon: GAME_ICONS.TILE_GRASS };
  }
};

export const getTileEffectStyle = (effect: TileEffect) => {
    switch (effect) {
        case TileEffect.HOLE: return "bg-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]";
        case TileEffect.WALL: return "bg-stone-600 border-4 border-stone-800 shadow-xl";
        case TileEffect.FROZEN: return "bg-cyan-300 opacity-80 shadow-[inset_0_0_5px_rgba(255,255,255,0.8)]";
        case TileEffect.LAVA: return "bg-red-900 animate-pulse shadow-[inset_0_0_15px_rgba(255,100,0,0.5)]";
        case TileEffect.PROMOTION: return "bg-yellow-400 opacity-60 animate-pulse shadow-[inset_0_0_15px_rgba(255,215,0,0.8)]";
        default: return "";
    }
};