
import { RelicType, Language, PieceType } from '../types';
import { TRANSLATIONS } from '../utils/locales';
import { GAME_ICONS } from '../components/assets/GameIcons';

export const RELIC_INFO: Record<RelicType, { basePrice: number; icon: string }> = {
  [RelicType.LAST_WILL]: { basePrice: 150, icon: GAME_ICONS.RELIC_LAST_WILL },
  [RelicType.NECROMANCY]: { basePrice: 250, icon: GAME_ICONS.RELIC_NECROMANCY },
  [RelicType.MIDAS_TOUCH]: { basePrice: 300, icon: GAME_ICONS.RELIC_MIDAS_TOUCH },
  [RelicType.DISCOUNT_CARD]: { basePrice: 200, icon: GAME_ICONS.RELIC_DISCOUNT_CARD },
  [RelicType.DISCOUNT_RELIC]: { basePrice: 200, icon: GAME_ICONS.RELIC_DISCOUNT_RELIC },
  [RelicType.START_PAWN]: { basePrice: 100, icon: GAME_ICONS.RELIC_START_PAWN },
  [RelicType.START_ROOK]: { basePrice: 250, icon: GAME_ICONS.RELIC_START_ROOK },
  [RelicType.START_KNIGHT]: { basePrice: 200, icon: GAME_ICONS.RELIC_START_KNIGHT },
  [RelicType.START_BISHOP]: { basePrice: 200, icon: GAME_ICONS.RELIC_START_BISHOP },
  [RelicType.START_QUEEN]: { basePrice: 400, icon: GAME_ICONS.RELIC_START_QUEEN },
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
