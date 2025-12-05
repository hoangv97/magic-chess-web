
import { TileEffect, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';

export const getTileEffectInfo = (lang: Language, type: TileEffect) => {
  return TRANSLATIONS[lang].tiles[type];
};

export const TILE_EFFECT_INFO: Record<TileEffect, { name: string; desc: string }> = {
  [TileEffect.NONE]: { name: "Grass", desc: "Standard terrain. No special effects." },
  [TileEffect.HOLE]: { name: "Abyss", desc: "A deep chasm. Pieces cannot stand here, but sliding pieces can pass over." },
  [TileEffect.WALL]: { name: "Stone Wall", desc: "A solid obstacle. Pieces cannot enter or pass through." },
  [TileEffect.FROZEN]: { name: "Frozen Ground", desc: "Slippery ice. Entering this tile freezes piece for next turn." },
  [TileEffect.LAVA]: { name: "Magma Pool", desc: "Deadly heat. Entering this tile destroys the piece." }
};
