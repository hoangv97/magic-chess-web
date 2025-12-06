


import { BossType, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';

export const getBossInfo = (lang: Language, type: BossType) => {
  if (type === BossType.NONE) return null;
  return TRANSLATIONS[lang].bosses[type];
};

export const getBossIcon = (type: BossType): string => {
  switch (type) {
    case BossType.FROST_GIANT: return '❄️';
    case BossType.BLIZZARD_WITCH: return '🌬️';
    case BossType.VOID_BRINGER: return '🕳️';
    case BossType.LAVA_TITAN: return '🌋';
    case BossType.STONE_GOLEM: return '🗿';
    case BossType.UNDEAD_LORD: return '💀';
    case BossType.CHAOS_LORD: return '🌀';
    case BossType.MIRROR_MAGE: return '🪞';
    case BossType.SOUL_EATER: return '👻';
    case BossType.BLOOD_KING: return '🩸';
    case BossType.HYDRA: return '🐍';
    case BossType.MIND_CONTROLLER: return '🧠';
    case BossType.SILENCER: return '🤐';
    case BossType.ILLUSIONIST: return '🎭';
    default: return '☠️';
  }
};