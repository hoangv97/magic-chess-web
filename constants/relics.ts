
import { RelicType, Language, PieceType } from '../types';
import { TRANSLATIONS } from '../utils/locales';

export const RELIC_INFO: Record<RelicType, { basePrice: number; icon: string }> = {
  [RelicType.LAST_WILL]: { basePrice: 150, icon: "⚰️" },
  [RelicType.NECROMANCY]: { basePrice: 250, icon: "💀" },
  [RelicType.MIDAS_TOUCH]: { basePrice: 300, icon: "💰" },
  [RelicType.DISCOUNT_CARD]: { basePrice: 200, icon: "🏷️" },
  [RelicType.DISCOUNT_RELIC]: { basePrice: 200, icon: "🏺" },
  [RelicType.START_PAWN]: { basePrice: 100, icon: "♟️" },
  [RelicType.START_ROOK]: { basePrice: 250, icon: "♜" },
  [RelicType.START_KNIGHT]: { basePrice: 200, icon: "♞" },
  [RelicType.START_BISHOP]: { basePrice: 200, icon: "♝" },
  [RelicType.START_QUEEN]: { basePrice: 400, icon: "♛" },
};

export const RELIC_LEVEL_REWARDS: Record<number, PieceType> = {
  1: PieceType.PAWN,
  2: PieceType.KNIGHT,
  3: PieceType.BISHOP,
  4: PieceType.ROOK,
  5: PieceType.QUEEN
};

export const getRelicInfo = (lang: Language, type: RelicType) => {
  const base = RELIC_INFO[type];
  const trans = TRANSLATIONS[lang].relics[type];
  return {
    ...base,
    name: trans.name,
    description: (lvl: number) => {
        let desc = trans.desc;
        if (type === RelicType.LAST_WILL || type === RelicType.NECROMANCY) {
           const piece = TRANSLATIONS[lang].pieces[RELIC_LEVEL_REWARDS[Math.min(lvl, 5)]];
           desc = desc.replace('{0}', piece);
        } else if (type === RelicType.START_PAWN || type === RelicType.START_ROOK || type === RelicType.START_KNIGHT || type === RelicType.START_BISHOP || type === RelicType.START_QUEEN) {
           desc = desc.replace('{0}', String(lvl));
        }
        return desc;
    }
  };
};
