
import { BossType, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';
import { GAME_ICONS } from '../components/assets/GameIcons';

export const getBossInfo = (lang: Language, type: BossType) => {
  if (type === BossType.NONE) return null;
  return TRANSLATIONS[lang].bosses[type];
};

export const getBossIcon = (type: BossType): string => {
  switch (type) {
    case BossType.FROST_GIANT: return GAME_ICONS.BOSS_FROST_GIANT;
    case BossType.BLIZZARD_WITCH: return GAME_ICONS.BOSS_BLIZZARD_WITCH;
    case BossType.VOID_BRINGER: return GAME_ICONS.BOSS_VOID_BRINGER;
    case BossType.LAVA_TITAN: return GAME_ICONS.BOSS_LAVA_TITAN;
    case BossType.STONE_GOLEM: return GAME_ICONS.BOSS_STONE_GOLEM;
    case BossType.UNDEAD_LORD: return GAME_ICONS.BOSS_UNDEAD_LORD;
    case BossType.CHAOS_LORD: return GAME_ICONS.BOSS_CHAOS_LORD;
    case BossType.MIRROR_MAGE: return GAME_ICONS.BOSS_MIRROR_MAGE;
    case BossType.SOUL_EATER: return GAME_ICONS.BOSS_SOUL_EATER;
    case BossType.BLOOD_KING: return GAME_ICONS.BOSS_BLOOD_KING;
    case BossType.HYDRA: return GAME_ICONS.BOSS_HYDRA;
    case BossType.MIND_CONTROLLER: return GAME_ICONS.BOSS_MIND_CONTROLLER;
    case BossType.SILENCER: return GAME_ICONS.BOSS_SILENCER;
    case BossType.ILLUSIONIST: return GAME_ICONS.BOSS_ILLUSIONIST;
    case BossType.THE_FACELESS: return GAME_ICONS.BOSS_THE_FACELESS;
    case BossType.CURSE_WEAVER: return GAME_ICONS.BOSS_CURSE_WEAVER;
    case BossType.DOOM_BRINGER: return GAME_ICONS.BOSS_DOOM_BRINGER;
    case BossType.SOUL_CORRUPTOR: return GAME_ICONS.BOSS_SOUL_CORRUPTOR;
    default: return GAME_ICONS.BOSS_DEFAULT;
  }
};
