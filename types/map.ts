export enum BossType {
  NONE = 'NONE',
  FROST_GIANT = 'FROST_GIANT',
  BLIZZARD_WITCH = 'BLIZZARD_WITCH',
  VOID_BRINGER = 'VOID_BRINGER',
  LAVA_TITAN = 'LAVA_TITAN',
  STONE_GOLEM = 'STONE_GOLEM',
  UNDEAD_LORD = 'UNDEAD_LORD',
  CHAOS_LORD = 'CHAOS_LORD',
  MIRROR_MAGE = 'MIRROR_MAGE',
  SOUL_EATER = 'SOUL_EATER',
  BLOOD_KING = 'BLOOD_KING',
  HYDRA = 'HYDRA',
  MIND_CONTROLLER = 'MIND_CONTROLLER',
  SILENCER = 'SILENCER',
  ILLUSIONIST = 'ILLUSIONIST',
  THE_FACELESS = 'THE_FACELESS',
  // New Bosses
  CURSE_WEAVER = 'CURSE_WEAVER',
  DOOM_BRINGER = 'DOOM_BRINGER',
  SOUL_CORRUPTOR = 'SOUL_CORRUPTOR',
  // Movement Restrictors
  KNIGHT_SNARE = 'KNIGHT_SNARE',
  ROOK_BREAKER = 'ROOK_BREAKER',
  BISHOP_BANE = 'BISHOP_BANE'
}

export enum MapNodeType {
  BATTLE = 'BATTLE',
  MINI_BOSS = 'MINI_BOSS',
  BOSS = 'BOSS',
  SHOP = 'SHOP',
  REST = 'REST',
  UNKNOWN = 'UNKNOWN'
}

export interface MapNode {
  id: string;
  level: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  next: string[];
  name?: string;
  bossType?: BossType;
  type: MapNodeType;
}